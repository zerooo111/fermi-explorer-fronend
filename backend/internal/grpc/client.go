package grpc

import (
	"context"
	"fmt"
	"io"
	"log"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	pb "github.com/continuum/backend/proto"
)

type Client struct {
	conn   *grpc.ClientConn
	client pb.SequencerServiceClient
}

// NewClient creates a new gRPC client connection to the sequencer
func NewClient(address string) (*Client, error) {
	conn, err := grpc.NewClient(address, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to sequencer: %w", err)
	}

	return &Client{
		conn:   conn,
		client: pb.NewSequencerServiceClient(conn),
	}, nil
}

// Close closes the gRPC connection
func (c *Client) Close() error {
	return c.conn.Close()
}

// GetStatus returns the current sequencer status
func (c *Client) GetStatus(ctx context.Context) (*pb.GetStatusResponse, error) {
	return c.client.GetStatus(ctx, &pb.GetStatusRequest{})
}

// GetTransaction retrieves a transaction by its hash
func (c *Client) GetTransaction(ctx context.Context, txHash string) (*pb.GetTransactionResponse, error) {
	return c.client.GetTransaction(ctx, &pb.GetTransactionRequest{
		TxHash: txHash,
	})
}

// GetTick retrieves a specific tick by number
func (c *Client) GetTick(ctx context.Context, tickNumber uint64) (*pb.GetTickResponse, error) {
	return c.client.GetTick(ctx, &pb.GetTickRequest{
		TickNumber: tickNumber,
	})
}

// GetChainState returns the current chain state
func (c *Client) GetChainState(ctx context.Context, tickLimit uint32) (*pb.GetChainStateResponse, error) {
	return c.client.GetChainState(ctx, &pb.GetChainStateRequest{
		TickLimit: tickLimit,
	})
}

// SubmitTransaction submits a new transaction
func (c *Client) SubmitTransaction(ctx context.Context, tx *pb.Transaction) (*pb.SubmitTransactionResponse, error) {
	return c.client.SubmitTransaction(ctx, &pb.SubmitTransactionRequest{
		Transaction: tx,
	})
}

// StreamTicks streams live ticks as they are produced
func (c *Client) StreamTicks(ctx context.Context, startTick uint64) (pb.SequencerService_StreamTicksClient, error) {
	return c.client.StreamTicks(ctx, &pb.StreamTicksRequest{
		StartTick: startTick,
	})
}

// StreamTicksHandler handles streaming ticks with a callback
func (c *Client) StreamTicksHandler(ctx context.Context, startTick uint64, handler func(*pb.Tick) error) error {
	stream, err := c.StreamTicks(ctx, startTick)
	if err != nil {
		return fmt.Errorf("failed to start tick stream: %w", err)
	}

	for {
		tick, err := stream.Recv()
		if err == io.EOF {
			log.Println("Stream ended")
			return nil
		}
		if err != nil {
			return fmt.Errorf("stream error: %w", err)
		}

		if err := handler(tick); err != nil {
			return fmt.Errorf("handler error: %w", err)
		}
	}
}