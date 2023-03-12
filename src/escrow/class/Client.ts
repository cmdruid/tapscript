/**
## Client Overview
 * The client must represent the current user.
 * The client should establish connections to other clients.
 * The client must listen for requests and return responses.
 * The client must also make requests and collect responses.

Clients must request, listen, and collect responses until
they have enough information to establish a full contract.

A full contract satisfies all input requirements for the
current user, including validation checks.

A user is only responsible for validating terms within their
own scope. Terms defined outside the current user's scope
will only be checked for origin and authenticity.

**/

export {}
