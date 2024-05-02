import { task } from "hardhat/config"
import { loadTreasuryContract } from "../helpers/helper";

task("initialize_service_provider_proxy", "init system contract")
    // change it to optional cause committee contract preload in genesis json