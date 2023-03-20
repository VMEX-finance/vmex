
import rawBRE from "hardhat";
before(async () => {
    await rawBRE.run("set-DRE");

    console.log("\n***************");
    console.log("DRE finished");
    console.log("***************\n");
  });