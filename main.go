package main

import (
	"runtime"
	"syscall"

	"github.com/unchartedsoftware/plog"
	"github.com/unchartedsoftware/prism"
	"github.com/unchartedsoftware/prism/generation/elastic"
	"github.com/unchartedsoftware/prism/generation/file"
	"github.com/unchartedsoftware/prism/generation/remote"
	"github.com/unchartedsoftware/prism/generation/rest"
	"github.com/unchartedsoftware/prism/store/redis"
	"github.com/zenazn/goji/graceful"

	"github.com/unchartedsoftware/prism-app-template/api"
)

const (
	port      = "8080"
	esHost    = "http://10.64.16.120"
	esPort    = "9200"
	redisHost = "localhost"
	redisPort = "6379"
)

func NewElasticPipeline() *prism.Pipeline {
	// Create pipeline
	pipeline := prism.NewPipeline()

	// Add boolean expression types
	pipeline.Binary(elastic.NewBinaryExpression)
	pipeline.Unary(elastic.NewUnaryExpression)

	// Add query types to the pipeline
	pipeline.Query("exists", elastic.NewExists)
	pipeline.Query("has", elastic.NewHas)
	pipeline.Query("equals", elastic.NewEquals)
	pipeline.Query("range", elastic.NewRange)

	// Add tiles types to the pipeline
	pipeline.Tile("count", elastic.NewCountTile(esHost, esPort))
	pipeline.Tile("heatmap", elastic.NewHeatmapTile(esHost, esPort))
	pipeline.Tile("macro", elastic.NewMacroTile(esHost, esPort))
	pipeline.Tile("micro", elastic.NewMicroTile(esHost, esPort))
	pipeline.Tile("top-term-count", elastic.NewTopTermCountTile(esHost, esPort))

	// Set the maximum concurrent tile requests
	pipeline.SetMaxConcurrent(32)
	// Set the tile requests queue length
	pipeline.SetQueueLength(1024)

	// Add meta types to the pipeline
	pipeline.Meta("default", elastic.NewDefaultMeta(esHost, esPort))

	// Add a store to the pipeline
	pipeline.Store(redis.NewStore(redisHost, redisPort, -1))

	return pipeline
}

func NewRESTPipeline() *prism.Pipeline {
	// Create pipeline
	pipeline := prism.NewPipeline()

	// Add tiles types to the pipeline
	pipeline.Tile("rest", rest.NewTile())

	// Set the maximum concurrent tile requests
	pipeline.SetMaxConcurrent(256)
	// Set the tile requests queue length
	pipeline.SetQueueLength(1024)

	// Add a store to the pipeline
	pipeline.Store(redis.NewStore(redisHost, redisPort, -1))

	return pipeline
}

func NewRemotePipeline() *prism.Pipeline {
	// Create pipeline
	pipeline := prism.NewPipeline()

	// Add tiles types to the pipeline
	pipeline.Tile("topic", remote.NewTopicTile())

	// Set the maximum concurrent tile requests
	pipeline.SetMaxConcurrent(256)
	// Set the tile requests queue length
	pipeline.SetQueueLength(1024)

	// Add a store to the pipeline
	pipeline.Store(redis.NewStore(redisHost, redisPort, -1))

	return pipeline
}

func NewFilePipeline() *prism.Pipeline {
	// Create pipeline
	pipeline := prism.NewPipeline()

	// Add tiles types to the pipeline
	pipeline.Tile("file", file.NewTile())

	// Set the maximum concurrent tile requests
	pipeline.SetMaxConcurrent(256)
	// Set the tile requests queue length
	pipeline.SetQueueLength(1024)

	// Add a store to the pipeline
	pipeline.Store(redis.NewStore(redisHost, redisPort, -1))

	return pipeline
}

func main() {
	// sets the maximum number of CPUs that can be executing simultaneously
	runtime.GOMAXPROCS(runtime.NumCPU())

	// register the pipelines
	prism.Register("elastic", NewElasticPipeline())
	prism.Register("file", NewFilePipeline())
	prism.Register("rest", NewRESTPipeline())
	prism.Register("remote", NewRemotePipeline())

	// create server
	app := api.New()

	// catch kill signals for graceful shutdown
	graceful.AddSignal(syscall.SIGINT, syscall.SIGTERM)

	// start server
	log.Infof("Prism server listening on port %s", port)
	err := graceful.ListenAndServe(":"+port, app)
	if err != nil {
		log.Error(err)
	}
	// wait until server gracefully exits
	graceful.Wait()
}
