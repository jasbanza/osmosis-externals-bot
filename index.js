"use strict";
import config from "./config/config.js";
import fetch from "node-fetch";
import { createServer } from "http";
import { ConsoleLogColors } from "js-console-log-colors";
const out = new ConsoleLogColors();

const server = createServer(async (req, res) => {
  // whenever a request is received...
  out.info("##### Client Request: " + req.method + " " + req.url);

  // we are using localhost, so request url isn't absolute, we need to just append it to a dummy domain for it to work
  const url = new URL(req.url, "http://example.test"); // leave this line as is
  if (req.method === "GET" || req.method === "POST") {
    // determine the type of action based on requested URL path
    const arrPath = url.pathname.split("/");
    const paths = ["updated"];
    if (paths.includes(arrPath[1])) {
      // if it is one of the valid paths...
      try {
        // get payload data from request stream...
        req.setEncoding("utf8");
        const rb = [];
        req.on("data", (chunks) => {
          rb.push(chunks);
        });
        // payload stream closed, json can be parsed...
        req.on("end", () => {
          const data = JSON.parse(rb.join(""));
          let txt = "";
          // determine action based on URL path...
          switch (arrPath[1]) {
            case "updated":
              console.log(data);
              break;
            default:
              break;
          }

          // HTTP Response 200 to client (in this case helpcrunch's webhook)
          res.writeHead(200, {
            "Content-Type": "application/json",
          });
        });

        // everything is successful, so just send an empty response to the webhook (and close the connection)
        res.write(JSON.stringify({ success: true }));
        res.end();
        return;
      } catch (error) {
        out.error(`An error occurred: ${error.message}`);
      }
    }
  }
  // requested page not valid...
  res.writeHead(404);
  res.end();
});

// start the server process...
server.listen(
  config.port,
  /*config.host,*/ () => {
    out.success(`Server is running on http://${config.host}:${config.port}`);
  }
);
