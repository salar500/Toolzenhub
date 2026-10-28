/* =========================================================
   ToolZen Hub
   Smart Flashcards deck: HTTP and APIs

   Plain data (see learning/content-schema.js). Original questions
   and explanations; the sources are the standards named on each card
   (RFC 9110 HTTP Semantics, RFC 9111 HTTP Caching, RFC 5789 PATCH,
   RFC 6585 additional status codes). Status code names are checked
   against a table written by hand from the RFCs in
   tests/unit/flashcards-content.test.mjs.
========================================================= */

export const deck = {
    id: "http-apis",
    version: "1.0.0",
    title: "HTTP and APIs",
    description: "Request methods, safe and idempotent, status codes and how to choose between them, the headers that describe a body, caching, and what an API test should check.",
    reviewed: {
        date: "2026-10-28",
        method: "Written and checked by the author against the text of RFC 9110, RFC 9111 and RFC 5789; status names checked against Node's http.STATUS_CODES. No second reviewer yet."
    },
    topics: [
        { id: "methods", title: "Methods" },
        { id: "status", title: "Status codes" },
        { id: "headers", title: "Headers and bodies" },
        { id: "caching", title: "Caching" },
        { id: "api-practice", title: "API practice" }
    ],
    cards: [
        {
            id: "http-post-meaning", topic: "methods", kind: "choice", difficulty: "intermediate",
            prompt: "A client sends POST /orders with a JSON body. Which statement is accurate?",
            options: [
                "POST asks the resource to process the enclosed data by its own rules; creating a record is a common use, not the only one.",
                "POST must always create a new resource, and the server must always answer with 201.",
                "POST is idempotent, so a client can repeat it freely without any effect.",
                "POST requests are not allowed to carry a body, only a query string."
            ],
            correct: 0,
            explanation: "RFC 9110 defines POST as processing the enclosed representation according to the target resource's own semantics. That covers creating a record, but also submitting a form, running a search with a long query, or triggering an action. Because repeating a POST may repeat the effect, it is not treated as idempotent.",
            source: "RFC 9110 section 9.3.3"
        },
        {
            id: "http-safe-methods", topic: "methods", kind: "recall", difficulty: "intermediate",
            prompt: "What does it mean for an HTTP method to be safe? Name two safe methods.",
            answer: "A safe method is read-only in its semantics: the client does not request or expect a change of state. GET and HEAD are safe (so are OPTIONS and TRACE).",
            explanation: "Safe is a statement about what the client asks for, not a promise about the server's internals: a safe request may still be logged or counted. The distinction matters because tools such as crawlers, prefetching and caches treat safe requests as harmless to repeat, so a GET that deletes data is a design fault.",
            source: "RFC 9110 section 9.2.1"
        },
        {
            id: "http-idempotent-methods", topic: "methods", kind: "recall", difficulty: "intermediate",
            prompt: "What does idempotent mean for an HTTP method, and which common methods are idempotent?",
            answer: "Sending the same request several times has the same intended effect on the server as sending it once. PUT and DELETE are idempotent, and so are the safe methods such as GET and HEAD. POST and PATCH are not defined as idempotent.",
            explanation: "Idempotence is what makes it acceptable for a client or proxy to retry a request after a timeout when it does not know whether the first attempt arrived. It concerns the effect on the server, not the response: a repeated DELETE may answer 404 the second time and still be idempotent.",
            source: "RFC 9110 section 9.2.2"
        },
        {
            id: "http-put-vs-patch", topic: "methods", kind: "choice", difficulty: "intermediate",
            prompt: "A client wants to change only the email field of a user record. Which method was defined for a partial update?",
            options: [
                "PUT, which is defined to send only the field that changes.",
                "GET, with the new email value added to the query string.",
                "PATCH, which carries a description of the changes to apply.",
                "HEAD, with the new email value in a request header."
            ],
            correct: 2,
            explanation: "PUT replaces the state of the target resource with the enclosed representation, so a PUT with only an email would normally mean a user that has only an email. PATCH (RFC 5789) was added for partial changes. Some APIs accept partial PUT bodies anyway, so always read the contract of the API you are using.",
            source: "RFC 9110 section 9.3.4; RFC 5789"
        },
        {
            id: "http-delete-repeated", topic: "methods", kind: "choice", difficulty: "advanced",
            prompt: "DELETE /items/7 removed the item. The client sends the identical request again. What does idempotence say about this?",
            options: [
                "The second request must also return 204, otherwise the server breaks the standard.",
                "The end state is the same, the item is gone, although the second response may be 404.",
                "The second request must restore the item, because DELETE toggles the state.",
                "The second request is invalid because a client may send DELETE only once."
            ],
            correct: 1,
            explanation: "Idempotent means the intended effect on the server is the same after one request or several, not that the responses are identical. After the first DELETE the item is already gone, so a later DELETE leaves the same state even if the server answers 404 or 410 instead of 204.",
            source: "RFC 9110 section 9.2.2"
        },
        {
            id: "http-head-method", topic: "methods", kind: "choice", difficulty: "beginner",
            prompt: "Which method asks for the same headers a GET would return, but no body?",
            options: [
                "OPTIONS",
                "TRACE",
                "CONNECT",
                "HEAD"
            ],
            correct: 3,
            explanation: "HEAD is identical to GET except that the server must not send a body in the response. It is useful for checking whether a resource exists, or reading its Content-Length and Last-Modified, without downloading it.",
            source: "RFC 9110 section 9.3.2"
        },
        {
            id: "http-get-with-body", topic: "methods", kind: "choice", difficulty: "advanced",
            prompt: "May a GET request carry a body?",
            options: [
                "Yes, and every server must use the body to filter the results.",
                "No, a body on GET is a syntax error that every server must reject.",
                "It is not forbidden, but the body has no defined meaning, and some servers and proxies reject or ignore it, so avoid it.",
                "Yes, but only when the Content-Length header is set to zero."
            ],
            correct: 2,
            explanation: "RFC 9110 says content sent in a GET request has no generally defined semantics, may cause some implementations to reject the request, and might be dropped by intermediaries. For a search with many criteria, use query parameters, or POST to a search resource if the query is too large for a URL.",
            source: "RFC 9110 section 9.3.1"
        },
        {
            id: "http-status-classes", topic: "status", kind: "recall", difficulty: "beginner",
            prompt: "What do the five classes of HTTP status codes (1xx to 5xx) mean?",
            answer: "1xx informational, 2xx successful, 3xx redirection, 4xx client error, 5xx server error.",
            explanation: "The first digit tells a client how to react even when it does not know the exact code: retry later on 5xx, fix the request on 4xx, follow the Location on most 3xx. A client must treat an unrecognised code as the x00 code of its class.",
            source: "RFC 9110 section 15"
        },
        {
            id: "http-404-missing", topic: "status", kind: "choice", difficulty: "beginner",
            prompt: "GET /users/9999 is requested, and no user with that id exists. Which status is the usual answer?",
            options: [
                "400 Bad Request",
                "404 Not Found",
                "500 Internal Server Error",
                "204 No Content"
            ],
            correct: 1,
            explanation: "404 says the server has no current representation for that target. The request itself was well formed, so 400 would blame the client's syntax, and 500 would claim that the server failed. Some APIs return 404 as well for a resource the caller is not allowed to know exists.",
            source: "RFC 9110 section 15 (404 Not Found)"
        },
        {
            id: "http-201-created", topic: "status", kind: "choice", difficulty: "intermediate",
            prompt: "A POST request successfully created a new resource. Which status is the usual answer, and which header often goes with it?",
            options: [
                "201 Created, with a Location header giving the new resource's URL.",
                "200 OK, with a Content-Length header giving the new id.",
                "202 Accepted, with an Expires header giving the creation time.",
                "302 Found, with a Cookie header giving the new record."
            ],
            correct: 0,
            explanation: "201 means the request succeeded and led to one or more new resources, and the Location header names the primary one. A client can then GET that URL. 202 is for work that was accepted but not yet carried out, which is different from created.",
            source: "RFC 9110 section 15 (201 Created)"
        },
        {
            id: "http-204-no-content", topic: "status", kind: "choice", difficulty: "intermediate",
            prompt: "A DELETE succeeded, and the server has nothing to put in the response body. Which status fits?",
            options: [
                "201 Created",
                "304 Not Modified",
                "205 Reset Content, so the browser clears the form",
                "204 No Content"
            ],
            correct: 3,
            explanation: "204 says the action succeeded and the response has no body. A 204 response must not contain a body, so an API client should not try to parse JSON from it, a common source of an unexpected end of input error.",
            source: "RFC 9110 section 15 (204 No Content)"
        },
        {
            id: "http-401-vs-403", topic: "status", kind: "choice", difficulty: "intermediate",
            prompt: "A user is signed in, but the API refuses to delete an invoice because their role does not allow it. Which status fits best?",
            options: [
                "401 Unauthorized, because the request has not been authenticated.",
                "403 Forbidden, because the identity is known but not allowed.",
                "404 Not Found, because every refusal must look like a missing page.",
                "400 Bad Request, because the user typed the invoice number wrongly."
            ],
            correct: 1,
            explanation: "Despite its name, 401 is about missing or invalid authentication: the server does not know who is asking, and the response carries a WWW-Authenticate challenge. 403 means the server understood the request and the caller's identity but refuses to authorise it.",
            source: "RFC 9110 section 15 (401 and 403)"
        },
        {
            id: "http-400-vs-422", topic: "status", kind: "choice", difficulty: "advanced",
            prompt: "A request body is syntactically valid JSON, but a required field is missing. Which answer is reasonable?",
            options: [
                "500 Internal Server Error, because the server cannot continue without the field.",
                "404 Not Found, because the missing field cannot be found.",
                "400 Bad Request or 422 Unprocessable Content, depending on the API's own convention.",
                "301 Moved Permanently, because the form should be sent again."
            ],
            correct: 2,
            explanation: "Both codes are used in practice for validation errors. 400 is the general client error; 422 says the content is well formed but the server cannot process its instructions. What matters is that the API documents its choice, uses it consistently and returns a body that names the failing field.",
            source: "RFC 9110 section 15 (400 and 422)"
        },
        {
            id: "http-500-vs-400", topic: "status", kind: "choice", difficulty: "intermediate",
            prompt: "A well-formed request reaches the server, but the code handling it throws an unhandled exception. Which class of status is correct?",
            options: [
                "4xx, such as 400 Bad Request, because the client sent the request.",
                "3xx, such as 302 Found, because the client should try again elsewhere.",
                "2xx, such as 200 OK, because the request was received.",
                "5xx, such as 500 Internal Server Error, because the server failed."
            ],
            correct: 3,
            explanation: "The class tells who is at fault. A request that the client could not have made any better and that still fails belongs to 5xx. In an API test, an unexpected 500 on a bad input is itself a defect: invalid input should produce a 4xx answer.",
            source: "RFC 9110 section 15 (500 Internal Server Error)"
        },
        {
            id: "http-redirect-permanent", topic: "status", kind: "choice", difficulty: "intermediate",
            prompt: "A page has moved permanently to a new URL. Which redirect status says so?",
            options: [
                "301 Moved Permanently (or 308, which also keeps the request method).",
                "302 Found, which tells clients the move may be temporary.",
                "304 Not Modified, which sends the visitor to the cached copy.",
                "307 Temporary Redirect, which keeps the method but not the move."
            ],
            correct: 0,
            explanation: "301 and 308 mean the new URL is permanent, so clients and search engines may update their records. 302 and 307 mean the move may change, so the original URL stays in use. 308 and 307 differ from 301 and 302 in that they never allow a client to change a POST into a GET.",
            source: "RFC 9110 section 15 (3xx redirection)"
        },
        {
            id: "http-429-rate-limit", topic: "status", kind: "choice", difficulty: "intermediate",
            prompt: "A client sends requests faster than the API allows. Which status tells it to slow down?",
            options: [
                "429 Too Many Requests, often with a Retry-After header.",
                "408 Request Timeout, because the client was too slow.",
                "507 Insufficient Storage, because the quota is exhausted.",
                "410 Gone, because the endpoint will no longer answer."
            ],
            correct: 0,
            explanation: "429 was added by RFC 6585 for rate limiting. The optional Retry-After header says how many seconds, or until what date, the client should wait. A well-behaved client backs off instead of retrying at once.",
            source: "RFC 6585 section 4"
        },
        {
            id: "http-503-unavailable", topic: "status", kind: "choice", difficulty: "intermediate",
            prompt: "A server is down for maintenance and expects to be back in ten minutes. Which status fits, and which header can say when to retry?",
            options: [
                "404 Not Found, with an Expires header.",
                "401 Unauthorized, with a WWW-Authenticate header.",
                "503 Service Unavailable, with a Retry-After header.",
                "201 Created, with a Location header."
            ],
            correct: 2,
            explanation: "503 means the server is currently unable to handle the request because of a temporary overload or maintenance. Retry-After lets a client or crawler come back later instead of treating the site as permanently broken.",
            source: "RFC 9110 section 15 (503 Service Unavailable)"
        },
        {
            id: "http-content-type", topic: "headers", kind: "recall", difficulty: "beginner",
            prompt: "What does the Content-Type header describe?",
            answer: "The media type of the body of the message that carries it, for example application/json, in a request or a response.",
            explanation: "A receiver uses Content-Type to decide how to read the bytes of the body. Sending JSON labelled as text/plain, or with no label at all, can make a server refuse it or parse it as something else. It describes the body being sent, not the body the client would like back.",
            source: "RFC 9110 section 8.3"
        },
        {
            id: "http-accept-header", topic: "headers", kind: "recall", difficulty: "intermediate",
            prompt: "What does the Accept request header tell the server?",
            answer: "Which media types the client can handle in the response, for example Accept: application/json.",
            explanation: "Accept is how a client takes part in content negotiation. A server may choose among representations, answer 406 Not Acceptable when it has none that matches, or simply ignore the header. Do not confuse it with Content-Type, which labels the body being sent.",
            source: "RFC 9110 section 12.5.1"
        },
        {
            id: "http-authorization-header", topic: "headers", kind: "choice", difficulty: "intermediate",
            prompt: "Which request header usually carries credentials, such as a Bearer token?",
            options: [
                "Content-Type",
                "Authorization",
                "Accept-Language",
                "Host"
            ],
            correct: 1,
            explanation: "A request header such as Authorization: Bearer followed by a token is the standard place for credentials. It should be sent only over HTTPS, because anyone who can read the request can read the token.",
            source: "RFC 9110 section 11.6.2"
        },
        {
            id: "http-missing-content-type", topic: "headers", kind: "choice", difficulty: "intermediate",
            prompt: "A client sends a JSON body in a POST request but leaves out the Content-Type header. What may happen?",
            options: [
                "The server always detects the format and treats the body as JSON without any problem.",
                "The server always answers 304 Not Modified, because the label is missing.",
                "The browser repairs the request by adding Accept: application/json.",
                "The server may answer 415 Unsupported Media Type, or read the body in a way the client did not intend."
            ],
            correct: 3,
            explanation: "Servers are not required to guess the format of a body. Many frameworks only parse JSON when the label says so, and otherwise leave the body empty or reject it with 415. Setting the header is a basic step in API testing.",
            source: "RFC 9110 section 8.3 and section 15 (415)"
        },
        {
            id: "http-secret-in-url", topic: "headers", kind: "choice", difficulty: "intermediate",
            prompt: "Why should an API key not be sent in the query string of a URL?",
            options: [
                "Query strings are limited to eight characters, which is too short for a key.",
                "Browsers refuse to send any request whose URL contains an equals sign.",
                "URLs are stored in server logs, browser history and Referer headers, so the key leaks.",
                "HTTP forbids a query string on any request that has an Authorization header."
            ],
            correct: 2,
            explanation: "A URL is treated as public data by much surrounding software: it is logged by proxies and servers, kept in history, and sometimes passed on to other sites. Credentials belong in a header or in the body, sent over HTTPS.",
            source: "RFC 9110 section 17.9"
        },
        {
            id: "http-no-store-vs-no-cache", topic: "caching", kind: "choice", difficulty: "advanced",
            prompt: "Which Cache-Control directive tells a cache not to store any part of the response?",
            options: [
                "no-cache, which still allows storing, but needs revalidation before reuse.",
                "no-store",
                "max-age=0, which lets a cache keep the response for zero seconds.",
                "private, which allows only the visitor's own browser to keep it."
            ],
            correct: 1,
            explanation: "The names are easy to mix up. no-store forbids storing the response at all, which suits sensitive data. no-cache allows a cache to store it but requires it to check with the server before each reuse. private and max-age=0 are different tools again.",
            source: "RFC 9111 section 5.2.2"
        },
        {
            id: "http-etag-304", topic: "caching", kind: "choice", difficulty: "advanced",
            prompt: "A client sends If-None-Match with the ETag of its stored copy, and the resource has not changed. What is the expected response?",
            options: [
                "304 Not Modified, with no body, so the client reuses its stored copy.",
                "200 OK, with the whole body again, to keep the client up to date.",
                "412 Precondition Failed, because the resource has not changed.",
                "204 No Content, which tells the client to delete its copy."
            ],
            correct: 0,
            explanation: "A conditional GET lets a cache ask whether its copy is still current. If the ETag still matches, the server answers 304 without a body, which saves bandwidth. If the resource has changed, the server sends 200 and the new representation.",
            source: "RFC 9110 section 13.1.2 and section 15 (304)"
        },
        {
            id: "http-etag-purpose", topic: "caching", kind: "recall", difficulty: "advanced",
            prompt: "What is an ETag, and what are two ways it is used?",
            answer: "An entity tag is an opaque identifier for one version of a resource's representation. It is used for conditional GET requests (If-None-Match) to save bandwidth, and for conditional updates (If-Match) to avoid overwriting someone else's change.",
            explanation: "The server decides how the tag is made; a client only compares tags for equality. With If-Match on a PUT, an update based on an old version is refused with 412, which stops two people from silently overwriting each other, the lost update problem.",
            source: "RFC 9110 section 8.8.3"
        },
        {
            id: "http-test-status-only", topic: "api-practice", kind: "recall", difficulty: "advanced",
            prompt: "Why is checking only the status code not enough in an API test?",
            answer: "A 200 can come with the wrong body: missing fields, wrong types, wrong values, or an error message inside a success response.",
            explanation: "The status says how the exchange went, not whether the data is right. A useful API test also checks the Content-Type, the structure and types of the body, and the values that the request should have produced, and for a create or update it checks the effect with a following read.",
            source: "RFC 9110 section 15"
        },
        {
            id: "http-negative-tests", topic: "api-practice", kind: "recall", difficulty: "intermediate",
            prompt: "Name three negative tests worth writing for an endpoint that creates a record.",
            answer: "Any three of: a required field missing, a field of the wrong type, a value out of range, a duplicate of an existing record, no credentials, credentials without permission, a body that is not valid JSON, a body that is too large.",
            explanation: "A negative test checks that bad input is refused cleanly: the right 4xx status, no record created, and a message that names the problem. It also protects against the opposite defect, where invalid data is accepted and stored.",
            source: "RFC 9110 section 15 (4xx)"
        },
        {
            id: "http-idempotency-key", topic: "api-practice", kind: "recall", difficulty: "advanced",
            prompt: "Why do some payment APIs accept an Idempotency-Key header on POST requests?",
            answer: "So that a request retried after a timeout is recognised as a repeat, and does not create a second payment.",
            explanation: "POST is not idempotent, but a client that never got an answer cannot tell whether the first attempt worked. A client-chosen key lets the server return the earlier result for a repeated key. This is a convention used by several APIs, so check the documentation of the one you use.",
            source: "RFC 9110 section 9.2.2"
        }
    ]
};
