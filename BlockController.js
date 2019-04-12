const SHA256 = require('crypto-js/sha256');
const BlockChain = require('./BlockChain.js');
const Block = require('./Block.js');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app 
     */
    constructor(app) {
        this.app = app;
        this.blockChain = new BlockChain.Blockchain();
        // this.blocks = 
        // this.initializeMockData();
        this.getBlockByIndex();
        this.postNewBlock();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
    getBlockByIndex() {
        let self = this;
        this.app.get("/api/block/:index", async (req, res) => {
            // console.log(req.params);
            // res.send(self.blocks[req.params.index]);

            let index = req.params.index || null;
            if(index === null || isNaN(index)){
                res.status(400).json({ error: 'Invalid index provided' });
                return;
            }

            let height = await self.blockChain.getBlockHeight();            
            if(height < index){
                res.status(400).json({ error: "Block doesn't exist" });
                return;                
            }

            self.blockChain.getBlock(index).then((block) => {
                //console.log(JSON.stringify(block));
                res.send(block);
            }).catch((err) => { console.log(err);});
        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        let self = this;
        this.app.post("/api/block", (req, res) => {
            // console.log(req.body.body);

            let data = req.body.body || "";

            let newBlock = new Block.Block(data);

            self.blockChain.addBlock(newBlock).then( result => {
                console.log(result); // Success!
                res.json(newBlock);
            }, reason => {
                console.log(reason); // Error!
                res.status(400).json({ error: 'Invalid index provided' });
              } );

        });
    }

    /**
     * Help method to inizialized Mock dataset, adds 10 test blocks to the blocks array
     */
    /*
    initializeMockData() {
        if(this.blocks.length === 0){
            for (let index = 0; index < 10; index++) {
                let blockAux = new BlockClass.Block(`Test Data #${index}`);
                blockAux.height = index;
                blockAux.hash = SHA256(JSON.stringify(blockAux)).toString();
                this.blocks.push(blockAux);
            }
        }
    }
    */

}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}