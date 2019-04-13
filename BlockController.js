const SHA256 = require('crypto-js/sha256');
const BlockChain = require('./BlockChain.js');
const Block = require('./Block.js');
const hex2ascii = require('hex2ascii');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app 
     */
    constructor(app, memPool) {
        this.app = app;
        this.blockChain = new BlockChain.Blockchain();
        this.memPool = memPool;
        this.getBlockByIndex();
        this.postNewBlock();
        this.getBlockByHash();
        this.getBlocksByWalletAddress();
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

                if(block.body.star.story){
                    //decode story before returning result
                    block.body.star.storyDecoded = hex2ascii(block.body.star.story);
                }

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

            let address = req.body.address || null;
            if(address === null){
                res.status(400).json({ error: 'Address not found in the request payload' });
                return;
            }

            let star = req.body.star || null;
            if(star === null){
                res.status(400).json({ error: 'Star not found in the request payload' });
                return;
            }

            if(star.ra === null || star.dec === null || star.story === null){
                res.status(400).json({ error: 'Star data not found in the request payload' });
                return;
            }

            self.memPool.findValidatedRequestByWallet(address).then((result) => {
                console.log(`Result from block controller for address: ${address}`);
                console.log(result);

                if(!result){
                    res.status(400).json({ error: 'Valid request not found for the provided wallet address.' });
                    return;                    
                }

                let data = {
                    "address": address,
                    "star": {
                        ra: star.ra,
                        dec: star.dec,
                        mag: star.mag,
                        cen: star.cen,
                        story: Buffer(star.story).toString('hex')
                    }
                }
    
                let newBlock = new Block.Block(data);
    
                self.blockChain.addBlock(newBlock).then( result => {
                    self.memPool.removeValidatedRequest(address);

                    //decode story before returning result
                    newBlock.body.star.storyDecoded = hex2ascii(newBlock.body.star.story);

                    console.log(result); // Success!
                    res.json(newBlock);
                }, reason => {
                    console.log(reason); // Error!
                    res.status(400).json({ error: 'Invalid index provided' });
                });
            });


        });
    }

    /**
     * Implement a GET Endpoint to retrieve a block by hash, url: "/api/stars/:hash"
     */
    getBlockByHash() {
        let self = this;
        this.app.get("/api/stars/hash::hash", async (req, res) => {
            // console.log(req.params);
            // res.send(self.blocks[req.params.hash]);

            let hash = req.params.hash || null;
            if(hash === null || hash.length !== 64){
                res.status(400).json({ error: 'Invalid hash provided' });
                return;
            }

            self.blockChain.getBlockByHash(hash).then((block) => {
                if(!block){
                    res.status(400).json({ error: "Block doesn't exist" });
                    return;                
                }
                
                if(block.body.star.story){
                    //decode story before returning result
                    block.body.star.storyDecoded = hex2ascii(block.body.star.story);
                }                

                res.send(block);
            }).catch((err) => { console.log(err);});
        });
    }

    /**
     * Implement a GET Endpoint to retrieve blocks by address, url: "/api/stars/:address"
     */
    getBlocksByWalletAddress() {
        let self = this;
        this.app.get("/api/stars/address::address", async (req, res) => {
            // console.log(req.params);
            // res.send(self.blocks[req.params.address]);

            let address = req.params.address || null;
            if(address === null){
                res.status(400).json({ error: 'Invalid address provided' });
                return;
            }

            if(address.length < 26 && address.length > 34){
                res.status(400).json({ error: 'Invalid address length (Required: Valid address consists of 26-34 characters)' });
                return;
            }

            self.blockChain.getBlocksByWalletAddress(address).then((blocks) => {
                if(!blocks){
                    res.status(400).json({ error: "Block doesn't exist" });
                    return;                
                }

                blocks.forEach((block) => {
                    if(block.body.star.story){
                        //decode story before returning result
                        block.body.star.storyDecoded = hex2ascii(block.body.star.story);
                    }                
                });

                res.send(blocks);
            }).catch((err) => { console.log(err);});
        });
    }    

}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app, memPool) => { return new BlockController(app, memPool);}