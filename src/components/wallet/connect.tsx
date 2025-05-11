'use client'
import Image from "next/image"
import { ethers, BrowserProvider } from "ethers";
import { Select } from '@headlessui/react'
import { useState } from "react";

export default function Connect() {
    let networkEnum: any = {
        'homestead': {
            name: "Ethereum",
            symbol: 'ETH'
        },
        'matic': {
            name: "Polygon",
            symbol: 'MATIC'
        },
        'arbitrum': {
            name: "Arbitrum One",
            symbol: 'ETH'
        }
    }

    const chainMap: any = {
        homestead: {
            chainId: '0x1',
        },
        matic: {
            chainId: '0x89',
            chainName: 'Polygon Mainnet',
            nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18,
            },
            rpcUrls: ['https://polygon-rpc.com/'],
            blockExplorerUrls: ['https://polygonscan.com/'],
        },
        arbitrum: {
            chainId: '0xa4b1',
            chainName: 'Arbitrum One',
            nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
            },
            rpcUrls: ['https://arb1.arbitrum.io/rpc'],
            blockExplorerUrls: ['https://arbiscan.io'],
        }
    }
    
    const [provider, setProvider]: any = useState(null);
    const [walletAddress, setWalletAddress]: any = useState(null);
    const [balanceETH, setBalanceETH]: any = useState(null);
    const [network, setNetwork]: any = useState(null);


    console.log(walletAddress)
    async function connect(lianInfo: any){
        // 连接MetaMask钱包
        const newProvider = new BrowserProvider(window.ethereum)
        setProvider(newProvider)
        //eth_requestAccounts
        // 获取链地址及相关信息
        const accounts = await newProvider.send(lianInfo.method, lianInfo.params)
        
        // 获得钱包地址
        const address = accounts[0];
        setWalletAddress(accounts[0])
        
        // 获得钱包金额
        const balance = await newProvider.getBalance(address)
        setBalanceETH(ethers.formatEther(balance)) // 单位ETH

        // 获得网络、链ID
        const networkInfo = await newProvider.getNetwork();
        setNetwork(networkInfo)
        console.log("网络:", networkInfo.name);
        console.log("链ID:", networkInfo.chainId);
    }

    async function handleNetworkChange(e: any) {
        const selectedNetwork = e.target.value;
        const chainInfo = chainMap[selectedNetwork];
        console.log(chainInfo)

        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: chainInfo.chainId }],
        });

            // 切换网络后重新调用connect，确保获取新网络的信息
        await connect({ method: 'eth_requestAccounts', params: [] });
    }

    async function sendETH(toAddress: string, amountInEth: string) {

        const signer = await provider.getSigner();
        console.log("Signer 地址:", await signer.getAddress());
        const tx = await signer.sendTransaction({
            to: toAddress,
            value: ethers.parseEther(amountInEth)
        });
        console.log("交易哈希:", tx.hash);
        await tx.wait();  // 等待链上确认
        console.log("转账完成");
    }
    

    return (
        <div className="py-[20px] h-full flex flex-col">
            <div className="px-[20px] pb-[10px] text-[18px] font-bold border-b-2 border-b-gray-400">
                {
                    walletAddress && balanceETH && network && 
                    <div className="flex flex-row justify-between">
                        <div>
                            {walletAddress.slice(0,4)}...{walletAddress.slice(-4)}
                        </div>
                        <div>
                            网络:
                            <select value={network?.name || ''} onChange={handleNetworkChange}>
                                <option value="homestead">Ethereum</option>
                                <option value="matic">Polygon</option>
                                <option value="arbitrum">Arbitrum One</option>
                            </select>
                            
                        </div>
                        <div>
                            {balanceETH} {networkEnum[network?.name]?.symbol || '' }
                        </div>
                    </div>
                }

                {!walletAddress && '连接钱包'}
                
            </div>
            <div className="w-full h-full flex flex-row justify-center items-center">


                {!walletAddress && 
                    <div className="w-[150px]">
                            <div className="flex items-center flex-row mb-[10px]">
                                <Image
                                    src="/wallet/metamask.svg"
                                    alt="Next.js logo"
                                    width={50}
                                    height={50}
                                    priority
                                />
                                <span className="ml-[5px] text-2xl">MetaMask</span>
                            </div>

                        <div onClick={() => {connect({ method:'eth_requestAccounts', params: [] })}} className="py-[2px] cursor-pointer bg-[#0e76fd] rounded-4xl text-center text-white font-bold">连接</div>
                    </div>
                }

                {
                    walletAddress && balanceETH && network && 

                    <div onClick={() => { sendETH('0xbC56D9800d6e98272Bf1F2D0B2BD5f596b0C4420', '1') }} className="py-[2px] cursor-pointer bg-[#0e76fd] rounded-4xl text-center text-white font-bold">转账</div>
                }
                
            </div>
        </div>
    )
}