const bitcoinLib = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');
const RequestObj = require('./RequestObj.js');
const RequestObjValid = require('./RequestObjValid.js');

const TimeoutRequestsWindowTime = 5*60*1000;
const TimeoutMempoolValidWindowTime = 30*60*1000;

/* ===== MemPool Class ==============================
|  Class with a constructor for mempool 		   |
|  ===============================================*/

class MemPool {
	constructor() {
        // Stores all user requests (unverified)
        //TODO: store mempool in leveldb
        this.mempool = [];

        // Removes all requests after 5 minutes
        this.timeoutRequests = [];

        // Stores all verified requests
        //TODO: store mempoolValid in leveldb
        this.mempoolValid = [];

        // Removes all verified requests after 30 minutes
        this.timeoutMempoolValid = [];
    }
    
    removeValidationRequest(walletAddress) {
        let self = this;

        if(self.timeoutRequests[walletAddress]){
            self.timeoutRequests[walletAddress] = null;
        }

        // TODO: keep mempool as key-value pair having walletAddress as key and requestObj as value
        // return new Promise((resolve, reject) => {
            let index = 0;
            self.mempool.forEach((mempoolObj) => {
                if(mempoolObj.walletAddress === walletAddress){
                    self.mempool.splice(index,1);
                }
                index++;                
            });
        // });
    }

    removeValidatedRequest(walletAddress) {
        let self = this;

        if(self.timeoutMempoolValid[walletAddress]){
            self.timeoutMempoolValid[walletAddress] = null;
        }

        // TODO: keep mempoolValid as key-value pair having walletAddress as key and requestObjValid as value
        // return new Promise((resolve, reject) => {
            let index = 0;
            self.mempoolValid.forEach((mempoolValidObj) => {
                if(mempoolValidObj.walletAddress === walletAddress){
                    self.mempoolValidObj.splice(index,1);
                }
                index++;                
            });
        // });
    }

    async addRequestValidation(walletAddress) {
        let self = this;
        return new Promise((resolve, reject) => {
            let requestObj = new RequestObj.RequestObj(walletAddress);
            //TODO: keep requestObj in leveldb
            self.mempool.push(requestObj);

            // automatically remove the request after specified window time
            self.timeoutRequests[walletAddress] = setTimeout(function(){ 
                self.removeValidationRequest(walletAddress) 
            }, TimeoutRequestsWindowTime );

            resolve(requestObj);
        });
    }

    async findRequestByWallet(walletAddress) {
        //check the request in mempool array 
        // resolve with object if found
        // resolve with null if not found

        let self = this;
        console.log(self.mempool.length);
        return new Promise((resolve, reject) => {
            //TODO: search mempoolObj in leveldb            
            self.mempool.forEach((mempoolObj) => {
                if(mempoolObj.walletAddress === walletAddress){
                    let timeElapse = (new Date().getTime().toString().slice(0,-3)) - mempoolObj.requestTimeStamp;
                    let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
                    mempoolObj.validationWindow = timeLeft;        
                    resolve(mempoolObj);
                }
            });
            resolve(null);
        });
    }

    async findValidatedRequestByWallet(walletAddress) {
        //check the request in mempoolValid array 
        // resolve with object if found
        // resolve with null if not found

        let self = this;
        console.log(self.mempoolValid.length);
        return new Promise((resolve, reject) => {
            //TODO: search mempoolValidObj in leveldb            
            self.mempoolValid.forEach((mempoolValidObj) => {
                if(mempoolValidObj.status.address === walletAddress){
                    let timeElapse = (new Date().getTime().toString().slice(0,-3)) - mempoolValidObj.status.requestTimeStamp;
                    let timeLeft = (TimeoutMempoolValidWindowTime/1000) - timeElapse;
                    mempoolValidObj.status.validationWindow = timeLeft;        
                    resolve(mempoolValidObj);
                }
            });
            resolve(null);
        });
    }

    /* Create a method that allows you to validate the request following this logic:
        Find your request in the `mempool` array by wallet address.
        Verify your windowTime.
        Verify the signature.
        Create the new object and save it into the `mempoolValid` array.
        If you have implemented a timeoutArray, make sure you clean it up before returning the object.
    */
    async validateRequestByWallet(mempoolObj, signature) {      
        let self = this;

        // Verify the windowTime.        
        // Verify the signature.
        let isValid = await bitcoinMessage.verify(mempoolObj.message, mempoolObj.walletAddress, signature);

        console.log("Validating the request object");
        console.log(isValid);

        if(isValid){
            // Create the new object and save it into the mempoolValid array.            
            let requestObjValid = new RequestObjValid.RequestObjValid(mempoolObj, isValid);

            //set the validation window
            let timeElapse = (new Date().getTime().toString().slice(0,-3)) - requestObjValid.status.requestTimeStamp;
            let timeLeft = (TimeoutMempoolValidWindowTime/1000) - timeElapse;
            requestObjValid.status.validationWindow = timeLeft;

            console.log(self.mempoolValid.length);

            //push to mempool validated requests array
            self.mempoolValid.push(requestObjValid);

            // automatically remove the validated request after specified window time
            self.timeoutMempoolValid[mempoolObj.walletAddress] = setTimeout(function(){
                self.removeValidatedRequest(mempoolObj.walletAddress) 
            }, TimeoutMempoolValidWindowTime );

            // If you have implemented a timeoutArray, make sure you clean it up before returning the object.

            // Return the validRequest object
            return requestObjValid;

        }

        console.log("Message-Signature validation failed against provided wallet address.")
        throw "Message-Signature validation failed against provided wallet address.";
    }
}

module.exports.MemPool = MemPool;