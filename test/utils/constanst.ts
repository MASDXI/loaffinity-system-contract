import { BigNumberish } from "ethers"
import { ethers } from "hardhat";

const SYSTEM_CALLER: string = "0x0000000000000000000000000000000000000F69";
const ONE_TRILLION_TOKEN: BigInt = ethers.parseEther("1000000000000");
const ONE_MILLION_TOKEN: BigInt = ethers.parseEther("1000000");
const ONE_HUNDRED_TOKEN: BigInt = ethers.parseEther("100");
const ONE_TOKEN: BigInt = ethers.parseEther("1");
const ZERO_TOKEN: BigInt = ethers.parseEther("0");

const VOTE_TYPE_REMOVE: number = 0;
const VOTE_TYPE_ADD: number = 1;

const VOTE_AGREE: boolean = true;
const VOTE_DIAGREE: boolean = false;

const ROOT_ADMIN_ROLE: string = "0x77ccc78fff97648b6361d5a6f0bd0a9f7c43fd29c1369941d3474c71311418fc";
const PROPOSER_ROLE: string = "0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1";
const COMMITEE_ROLE: string = "0x08da096d11689a7c6ed04f3885d9296d355e262ee0f570fe692a8d9ec7ebd3c4";

export { SYSTEM_CALLER, ONE_TRILLION_TOKEN, VOTE_AGREE, VOTE_DIAGREE, COMMITEE_ROLE, PROPOSER_ROLE, ROOT_ADMIN_ROLE};
