+++
title = "TechLog: The Penta Account Model"
author = "Penta Development Team"
date = "2018-08-01T13:47:08+02:00"
tags = ["technology, development, august"]
categories = ["Technology Development"]
+++
Starting in August, as part of Penta's &#39;universal connector&#39; mission to be a global network that interoperates and interconnects with other projects and off-chain systems we are posting a series of technical documentation articles to Medium. The first of these outlines the Penta Account data model, and how it underpins the rest of the platform architecture.<!--more-->

There are two types of Penta accounts: common user or just user, and contract accounts. External accounts fall into the common user account category, while contract accounts are utilised for smart contract information storage. Together they are core elements of the Penta data model.

In Bitcoin nomenclature addresses, like bank account numbers, are where to deposit bitcoins (BTC). In the Penta data model these are instead referred to as accounts. Ownership of Penta accounts is either on an individual or group basis, and only account holders can transact on the Penta blockchain. Accounts are the fundamental machinery DApp users connect to the Penta blockchain with, and the basic data structure containing user summary data, like a total account balance.

Among the benefits of the Account-Balance Model are:

• Simplified developer (Penta blockchain integration) api usage, reducing the complexity of creating and maintaining a DApp model layer

• Streamlined transaction processing. Basically, only validation of the payer account balance is needed to authorize a transaction, without a computationally intensive review of prior transactions on the chain.

[~ Read the full article on Medium](https://medium.com/penta-network/penta-account-model-outline-86973ef738ad)