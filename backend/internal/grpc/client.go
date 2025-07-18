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
	ctx    context.Context
	cancel context.CancelFunc
}

// NewClient creates a new gRPC client connection to the sequencer
func NewClient(address string) (*Client, error) {
	conn, err := grpc.NewClient(address, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to sequencer: %w", err)
	}

	ctx, cancel := context.WithCancel(context.Background())

	return &Client{
		conn:   conn,
		client: pb.NewSequencerServiceClient(conn),
		ctx:    ctx,
		cancel: cancel,
	}, nil
}

// Close closes the gRPC connection and cancels all operations
func (c *Client) Close() error {
	c.cancel() // Cancel all ongoing operations
	return c.conn.Close()
}

// Shutdown initiates a graceful shutdown of the gRPC client
func (c *Client) Shutdown(ctx context.Context) error {
	c.cancel() // Cancel all ongoing operations
	
	// Close connection with timeout
	done := make(chan error, 1)
	go func() {
		done <- c.conn.Close()
	}()
	
	select {
	case err := <-done:
		return err
	case <-ctx.Done():
		return ctx.Err()
	}
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


// StreamTicks streams live ticks as they are produced
func (c *Client) StreamTicks(ctx context.Context, startTick uint64) (pb.SequencerService_StreamTicksClient, error) {
	return c.client.StreamTicks(ctx, &pb.StreamTicksRequest{
		StartTick: startTick,
	})
}

// StreamTicksHandler handles streaming ticks with a callback
func (c *Client) StreamTicksHandler(ctx context.Context, startTick uint64, handler func(*pb.Tick) error) error {
	// Combine client context with provided context
	streamCtx, cancel := context.WithCancel(ctx)
	defer cancel()
	
	// Also listen for client shutdown
	go func() {
		select {
		case <-c.ctx.Done():
			cancel()
		case <-streamCtx.Done():
		}
	}()
	
	stream, err := c.StreamTicks(streamCtx, startTick)
	if err != nil {
		return fmt.Errorf("failed to start tick stream: %w", err)
	}

	for {
		select {
		case <-streamCtx.Done():
			return streamCtx.Err()
		default:
		}
		
		tick, err := stream.Recv()
		if err == io.EOF {
			log.Println("Stream ended")
			return nil
		}
		if err != nil {
			// Check if it's a context cancellation error
			if streamCtx.Err() != nil {
				return streamCtx.Err()
			}
			return fmt.Errorf("stream error: %w", err)
		}

		if err := handler(tick); err != nil {
			return fmt.Errorf("handler error: %w", err)
		}
	}
}