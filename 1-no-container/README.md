## Basic Node.js Server

This is an example of a basic monolithic node.js service that has been designed to run directly on a server, without a container. It serves as a simple yet effective approach to deploying applications without the complexities of containerization.

### Architecture

Since Node.js programs run a single threaded event loop, it is necessary to use the node `cluster` functionality to maximize CPU core utilization.  

In this example `cluster` is used to spawn one worker process per core, and the processes share a single port using round-robin load balancing built into Node.js.This approach enhances performance and ensures better resource management.

We can use an Application Load Balancer to round-robin requests across multiple servers, providing horizontal scaling, which allows for handling increased traffic efficiently.

![Reference diagram of the basic node application deployment](../images/monolithic-no-container.png)
