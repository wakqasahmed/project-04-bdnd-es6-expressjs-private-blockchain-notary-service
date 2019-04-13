/**
 * Controller Definition to encapsulate routes to work with mempool
 */
class MemPoolController {

    /**
     * Constructor to create a new MemPoolController, you need to initialize here all your endpoints
     * @param {*} app 
     */
    constructor(app, memPool) {
        this.app = app;
        this.memPool = memPool;
        this.requestValidation();
        this.validateRequestByWallet();
    }

    /**
     * Implement a POST Endpoint to add a new requestObj, url: "/api/requestValidation"
     */
    requestValidation() {
        let self = this;
        this.app.post("/api/requestValidation", (req, res) => { 
            // Your code
            console.log(req.body.address);

            let walletAddress = req.body.address || null;
            if(walletAddress === null){
                res.status(400).json({ error: 'Address not found in the request' });
                return;
            }

            self.memPool.findRequestByWallet(walletAddress).then( result => {
                if(result){
                    console.log(result); // Success!
                    res.json(result);
                    return;
                }

                self.memPool.addRequestValidation(walletAddress).then( result => {
                    console.log(result); // Success!
                    res.json(result);
                }, reason => {
                    console.log(reason); // Error!
                    res.status(400).json({ error: 'Something went wrong while adding validation request to mempool' });
                });

            }, reason => {
                console.log(reason); // Error!
                res.status(400).json({ error: 'Something went wrong while finding request in mempool' });
                return;
            });
        });        
    }

    validateRequestByWallet() {
        let self = this;
        this.app.post("/api/message-signature/validate", (req, res) => {

            let walletAddress = req.body.address || null;
            let signature = req.body.signature || null;

            if(walletAddress === null){
                res.status(400).json({ error: 'Address not found in the request' });
                return;
            }

            if(signature === null){
                res.status(400).json({ error: 'Signature not found in the request' });
                return;
            }

            // Find the request in the mempoolValid array by wallet address.                        
            self.memPool.findValidatedRequestByWallet(walletAddress).then(mempoolValidObj => {
                if(mempoolValidObj){
                    console.log("RequestObjValid found in mempoolValid array"); // Success! RequestObjValid found in mempoolValid array
                    res.json(mempoolValidObj);
                    return;
                }

                // Find the request in the mempool array by wallet address.            
                self.memPool.findRequestByWallet(walletAddress).then(mempoolObj => {
                    if(!mempoolObj){
                        console.log("RequestObj not found in mempool"); // Request not found in mempool!
                        res.status(400).json({ error: 'Could not find request in mempool' });
                        return;
                    }

                    self.memPool.validateRequestByWallet(mempoolObj, signature).then(result => {
                        console.log(result); // Success!
                        res.json(result);
                    }, reason => {
                        console.log(reason); // Error!
                        res.status(400).json({ error: 'Something went wrong while validating signed message against the provided address' });
                    });           

                }, reason => {
                    console.log(reason); // Error!
                    res.status(400).json({ error: 'Something went wrong while finding request in mempool' });
                }); 

            }, reason => {
                console.log(reason); // Error!
                res.status(400).json({ error: 'Something went wrong while finding validated request object in mempoolValid array' });
            });

        });
    }
}

/**
 * Exporting the MemPoolController class
 * @param {*} app 
 */
module.exports = (app, memPool) => { return new MemPoolController(app, memPool);}