# Getting Set Up

To run the Certora Prover you will need a key. Please dm teryanarmen/teryanarmen#2961 on discord or join the Certora [discord](https://discord.gg/zyrSpeKf) channel and send a message in #access-key-requests. Then follow the installation instructions found [here](https://docs.certora.com/en/latest/docs/user-guide/getting-started/install.html).

To set up your working environment, you can import [the public repo](https://github.com/VMEX-finance/vmex) into your own private repo. Go [here](https://github.com/new/import). Make sure to give access to `teryanarmen` so we can review your work.

And thats it, you can start verifying!

# Verification with Certora Prover 

A basic setup and example for verification of AssetMapping.sol.

This folder contains specification files and helper contract in addition to Prover configuration files.  

To run the prover, from the `packages/contracts/` folder run:

```
certoraRun certora/conf/AssetMapping.conf
``` 
or any other configuration file. 

See [docs.certora.com](http://docs.certora.com) for more information.

# Submissions

No extra steps needed for submission, just make sure to stop making changes once the deadline is reached. Any changes after the deadline will be disregarded for the reward assessment. Make sure all your rules are passing unless they are catching a real bug, for which you should also add a markdown file with a description of the vulnerability or a link to a submission on Hats github. After the deadline we will review your rules and determine the winners. Good luck! 
