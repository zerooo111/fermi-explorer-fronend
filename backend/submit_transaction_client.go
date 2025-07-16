package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"flag"
	"fmt"
	"log"
	"time"

	pb "github.com/continuum/backend/proto"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

var (
	grpcAddr = flag.String("addr", "localhost:9090", "gRPC server address")
	txCount  = flag.Int("count", 1, "Number of transactions to submit")
	payload  = flag.String("payload", "Hello Continuum!", "Transaction payload")
	verbose  = flag.Bool("v", false, "Verbose output")
)

func main() {
	flag.Parse()

	// Connect to gRPC server

	conn, err := grpc.NewClient(*grpcAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("Failed to connect to gRPC server: %v", err)
	}
	defer conn.Close()

	client := pb.NewSequencerServiceClient(conn)

	// Test 1: Check server status first
	fmt.Println("🔍 Testing Sequencer Status...")
	statusCtx, statusCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer statusCancel()
	status, err := client.GetStatus(statusCtx, &pb.GetStatusRequest{})
	if err != nil {
		log.Fatalf("Failed to get status: %v", err)
	}
	fmt.Printf("✅ Sequencer Status:\n")
	fmt.Printf("   Current Tick: %d\n", status.CurrentTick)
	fmt.Printf("   Total Transactions: %d\n", status.TotalTransactions)
	fmt.Printf("   Pending Transactions: %d\n", status.PendingTransactions)
	fmt.Printf("   Uptime: %d seconds\n", status.UptimeSeconds)
	fmt.Printf("   TPS: %.2f\n\n", status.TransactionsPerSecond)

	// Test 2: Submit transactions
	fmt.Printf("📤 Submitting %d transaction(s)...\n", *txCount)

	successCount := 0
	var lastTxHash string

	for i := 0; i < *txCount; i++ {
		// Generate transaction
		tx := generateTransaction(i, *payload)

		if *verbose {
			fmt.Printf("\nTransaction %d:\n", i+1)
			fmt.Printf("   TX ID: %s\n", tx.TxId)
			fmt.Printf("   Payload: %s\n", string(tx.Payload))
			fmt.Printf("   Nonce: %d\n", tx.Nonce)
			fmt.Printf("   Timestamp: %d\n", tx.Timestamp)
		}

		// Submit transaction with individual timeout
		submitCtx, submitCancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer submitCancel()
		startTime := time.Now()
		resp, err := client.SubmitTransaction(submitCtx, &pb.SubmitTransactionRequest{
			Transaction: tx,
		})
		submitDuration := time.Since(startTime)

		if err != nil {
			fmt.Printf("❌ Failed to submit transaction %d: %v\n", i+1, err)
			continue
		}

		successCount++
		lastTxHash = resp.TxHash

		fmt.Printf("✅ Transaction %d submitted successfully:\n", i+1)
		fmt.Printf("   TX Hash: %s\n", resp.TxHash)
		fmt.Printf("   Sequence Number: %d\n", resp.SequenceNumber)
		fmt.Printf("   Expected Tick: %d\n", resp.ExpectedTick)
		fmt.Printf("   Submit Time: %v\n", submitDuration)

		// Small delay between submissions for multiple transactions
		if i < *txCount-1 {
			time.Sleep(10 * time.Millisecond)
		}
	}

	fmt.Printf("\n📊 Summary: %d/%d transactions submitted successfully\n\n", successCount, *txCount)

	// Test 3: Verify transaction was included (if we submitted at least one)
	if successCount > 0 && lastTxHash != "" {
		fmt.Println("🔍 Verifying transaction inclusion...")

		// Wait a bit for the transaction to be included in a tick
		time.Sleep(500 * time.Millisecond)

		getTxCtx, getTxCancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer getTxCancel()
		txResp, err := client.GetTransaction(getTxCtx, &pb.GetTransactionRequest{
			TxHash: lastTxHash,
		})

		if err != nil {
			fmt.Printf("⚠️  Failed to retrieve transaction: %v\n", err)
		} else if !txResp.Found {
			fmt.Printf("⚠️  Transaction not found yet (may still be pending)\n")
		} else {
			fmt.Printf("✅ Transaction verified:\n")
			fmt.Printf("   Found in Tick: %d\n", txResp.TickNumber)
			fmt.Printf("   Sequence Number: %d\n", txResp.Transaction.SequenceNumber)
			fmt.Printf("   Ingestion Timestamp: %d\n", txResp.Transaction.IngestionTimestamp)

			// Verify the tick that contains our transaction
			getTickCtx, getTickCancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer getTickCancel()
			tickResp, err := client.GetTick(getTickCtx, &pb.GetTickRequest{
				TickNumber: txResp.TickNumber,
			})

			if err == nil && tickResp.Found {
				fmt.Printf("\n📦 Tick Details:\n")
				fmt.Printf("   Tick Number: %d\n", tickResp.Tick.TickNumber)
				fmt.Printf("   Transactions in Tick: %d\n", len(tickResp.Tick.Transactions))
				fmt.Printf("   Batch Hash: %s\n", tickResp.Tick.TransactionBatchHash)
				fmt.Printf("   VDF Iterations: %d\n", tickResp.Tick.VdfProof.Iterations)
			}
		}
	}

	// Test 4: Test batch submission if multiple transactions requested
	if *txCount > 1 {
		fmt.Println("\n📤 Testing Batch Submission...")

		// Create batch of transactions
		batchSize := min(5, *txCount)
		batch := make([]*pb.Transaction, batchSize)
		for i := 0; i < batchSize; i++ {
			batch[i] = generateTransaction(1000+i, fmt.Sprintf("Batch TX %d", i))
		}

		startTime := time.Now()
		batchCtx, batchCancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer batchCancel()
		batchResp, err := client.SubmitBatch(batchCtx, &pb.SubmitBatchRequest{
			Transactions: batch,
		})
		batchDuration := time.Since(startTime)

		if err != nil {
			fmt.Printf("❌ Batch submission failed: %v\n", err)
		} else {
			fmt.Printf("✅ Batch submitted successfully:\n")
			fmt.Printf("   Batch Size: %d\n", len(batchResp.Responses))
			fmt.Printf("   Submit Time: %v\n", batchDuration)
			fmt.Printf("   Avg Time per TX: %v\n", batchDuration/time.Duration(len(batchResp.Responses)))

			for i, resp := range batchResp.Responses {
				if *verbose {
					fmt.Printf("   TX %d: Hash=%s, SeqNum=%d, ExpectedTick=%d\n",
						i, resp.TxHash, resp.SequenceNumber, resp.ExpectedTick)
				}
			}
		}
	}

	fmt.Println("\n✅ All tests completed!")
}

func generateTransaction(index int, payload string) *pb.Transaction {
	// Generate random transaction ID
	txIdBytes := make([]byte, 16)
	rand.Read(txIdBytes)
	txId := hex.EncodeToString(txIdBytes)

	// Generate mock signature and public key
	signature := make([]byte, 64)
	rand.Read(signature)

	publicKey := make([]byte, 32)
	rand.Read(publicKey)

	return &pb.Transaction{
		TxId:      txId,
		Payload:   []byte(fmt.Sprintf("%s [%d]", payload, index)),
		Signature: signature,
		PublicKey: publicKey,
		Nonce:     uint64(index),
		Timestamp: uint64(time.Now().UnixMicro()),
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
