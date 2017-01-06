package routes

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	log "github.com/unchartedsoftware/plog"
	_ "github.com/unchartedsoftware/prism/util/json"
	"github.com/zenazn/goji/web"

	_ "github.com/parnurzeal/gorequest"
)

const (
	// TopicsRoute represents the HTTP route for the resource.
	TopicsRoute = "/topics/:level/:x/:y"
)

// InitResult is a container for the results of initialize()
type InitResult struct {
	params map[string]interface{}
}

func handleErr(w http.ResponseWriter) {
	handleErrWithMsg(w, "Unknown error.")
}

func handleErrWithMsg(w http.ResponseWriter, msg string) {
	log.Errorf(msg)
	w.WriteHeader(500)
	fmt.Fprintf(w, `{"status": "error", "message": "%s"}`, msg)
}

// parseURLParams parses the parameters supplied in the request body
func parseURLParams(url map[string]string, body io.ReadCloser) (map[string]interface{}, error) {
	// parse params map
	decoder := json.NewDecoder(body)
	params := make(map[string]interface{})
	err := decoder.Decode(&params)
	if err != nil {
		return nil, err
	}
	return params, nil
}

// Parses the parameters supplied in the request body
func initialize(c web.C, w http.ResponseWriter, r *http.Request) (*InitResult, error) {
	// Get the parameters that specify the specifics of the query
	params, err := parseURLParams(c.URLParams, r.Body)
	if err != nil {
		return nil, err
	}

	return &InitResult{params}, nil
}

// TopicsHandler represents the HTTP route response handler for /topics.
func TopicsHandler(c web.C, w http.ResponseWriter, r *http.Request) {
	initResult, err := initialize(c, w, r)
	if err != nil {
		handleErr(w)
		return
	}

	// Build request object.
	terms := initResult.params["terms"]
	tiles := initResult.params["tiles"]
	reqParam := make(map[string]interface{})
	reqParam["terms"] = terms
	reqParam["tiles"] = tiles

	// Query the Topic Modelling System.
	//TODO: Need to actually call the system. We do not have the spec on that yet.
	//request := gorequest.New()
	//resp, result, errs := request.Post("").Send(reqParam).End()

	//TEMP FOR TESTING ONLY!
	result := `{
	"tiles": [{
		"tile": {
			"x": 5,
			"y": 4,
			"level": 12
		},
		"topic": [{
			"score": 4.315,
			"words": [{
				"score": 1.23,
				"word": "food"
			}, {
				"score": 0.9855,
				"word": "burger"
			}, {
				"score": 0.72735,
				"word": "fries"
			}, {
				"score": 0.71,
				"word": "drinks"
			}]
		}]
	}, {
		"tile": {
			"x": 5,
			"y": 6,
			"level": 12
		},
		"topic": [{
			"score": 3.1,
			"words": [{
				"score": 2.06,
				"word": "coke"
			}, {
				"score": 0.6855,
				"word": "burger"
			}, {
				"score": 0.55,
				"word": "pepsi"
			}, {
				"score": 0.534,
				"word": "drinks"
			}]
		}]
	}]
}`

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, result)
}
