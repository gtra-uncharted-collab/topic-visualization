package api

import (
	h "net/http"

	"github.com/gtra-uncharted-collab/topic-visualization/api/routes"
	"github.com/unchartedsoftware/plog"
	"github.com/unchartedsoftware/prism-server/http"
	"github.com/unchartedsoftware/prism-server/middleware"
	"github.com/unchartedsoftware/prism-server/ws"
	"github.com/zenazn/goji/web"
)

// New returns a new Goji Mux handler to process HTTP requests.
func New() h.Handler {
	r := web.New()

	// mount logger middleware
	r.Use(middleware.Log)
	// mount gzip middleware
	r.Use(middleware.Gzip)

	// meta websocket handler
	log.Infof("Meta WebSocket route: '%s'", ws.MetaRoute)
	r.Get(ws.MetaRoute, ws.MetaHandler)

	// tile websocket handler
	log.Infof("Tile WebSocket route: '%s'", ws.TileRoute)
	r.Get(ws.TileRoute, ws.TileHandler)

	// metadata request handler
	log.Infof("Meta HTTP route: '%s'", http.MetaRoute)
	r.Post(http.MetaRoute, http.MetaHandler)
	// tile request handler
	log.Infof("Tile HTTP route: '%s'", http.TileRoute)
	r.Post(http.TileRoute, http.TileHandler)

	// Topics request handler
	log.Infof("Topics Path route: '%s'", routes.TopicsRoute)
	r.Post(routes.TopicsRoute, routes.TopicsHandler)

	// add greedy route last
	r.Get("/*", h.FileServer(h.Dir("./build/public")))
	return r
}
