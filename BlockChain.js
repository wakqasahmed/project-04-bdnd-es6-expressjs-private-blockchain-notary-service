/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {

    constructor() {
        this.bd = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock();
    }

    // Helper method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    generateGenesisBlock(){
        this.bd.getBlockHeight().then((blockHeight) => {

            if(blockHeight === -1){
              this.addBlock(new Block.Block("First block in the chain - Genesis block")).then(() => {
                // console.log("Genesis block created successfully");
              });
            }      
      
          });
    }

    // Get block height, it is a helper method that return the height of the blockchain
    async getBlockHeight() {
        return this.bd.getBlockHeight();
    }

    // Add new block
    async addBlock(newBlock) {
        // Block height
        let currentBlockHeight = await this.bd.getBlockHeight();
        newBlock.height = currentBlockHeight + 1;

        // UTC timestamp
        newBlock.time = new Date().getTime().toString().slice(0,-3);

        // console.log("Current Block Height: " + currentBlockHeight);

        // previous block hash
        if(currentBlockHeight > -1){
        let currentBlock = await this.getBlock(currentBlockHeight);
        newBlock.previousBlockHash = currentBlock.hash;
        }
        // Block hash with SHA256 using newBlock and converting to a string
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
        
        // Adding block to level db
        await this.bd.addLevelDBData(newBlock.height, JSON.stringify(newBlock));

        return newBlock;
    }

    // Get Block By Height
    async getBlock(height) {
      // return object as a single string
      let block = await this.bd.getLevelDBData(height);      

      // console.log(JSON.parse(block).hash);
      return JSON.parse(block);
    }

    // Validate if Block is being tampered by Block Height
    async validateBlock(height) {
      // get block object
      let block = await this.getBlock(height);
      // get block hash
      let blockHash = block.hash;
      // remove block hash to test block integrity
      block.hash = '';
      // generate block hash
      let validBlockHash = SHA256(JSON.stringify(block)).toString();
      // Compare
      if (blockHash===validBlockHash) {
          return true;
        } else {
          console.log('Block #'+height+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
          return false;
        }
    }

    // Validate Blockchain
    async validateChain() {
        let errorLog = [];
        let blockHeight = await this.bd.getBlockHeight();
  
        for (var i = 0; i < blockHeight-1; i++) {
          // validate block
          let isValidBlock = await this.validateBlock(i);
                  
          if (!isValidBlock){
            errorLog.push(i);
          }
  
          // compare blocks hash link
          let currentBlock = await this.getBlock(i);
          let nextBlock = await this.getBlock(i+1);
  
          let blockHash = currentBlock.hash;
          let previousHash = nextBlock.previousBlockHash;
  
          if (blockHash!==previousHash) {
            errorLog.push(i);
          }
        }
  
        if (errorLog.length>0) {
          console.log('Block errors = ' + errorLog.length);
          console.log('Blocks: '+errorLog);
          return errorLog;
        } else {
          console.log('No errors detected');
          return errorLog;
        }
    }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise( (resolve, reject) => {
            self.bd.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => { console.log(err); reject(err)});
        });
    }
   
}

module.exports.Blockchain = Blockchain;
