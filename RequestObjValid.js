/* ===== RequestObjValid Class ==============================
|  Class with a constructor for requestObjValid 			   |
|  ===============================================*/

class RequestObjValid {
	constructor(requestObj, validSignature){
                this.registerStar = true;
                this.status = {
                        address: requestObj.walletAddress,
                        requestTimeStamp: requestObj.requestTimeStamp,
                        message: requestObj.message,
                        validationWindow: requestObj.validationWindow,
                        messageSignature: validSignature
                }
	}
}

module.exports.RequestObjValid = RequestObjValid;