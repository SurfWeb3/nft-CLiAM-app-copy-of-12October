'use client';

import Image from "next/image";
import { ConnectButton, MediaRenderer, TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import thirdwebIcon from "@public/thirdweb.svg";
import { client } from "./client";
import { defineChain, getContract, toEther } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { getContractMetadata } from "thirdweb/extensions/common";
import { claimTo, getActiveClaimCondition, getTotalClaimedSupply, nextTokenIdToMint, transferFrom } from "thirdweb/extensions/erc721";
import { useState } from "react";
import NFTTransferModal from "@/components/modal/NFTTransferModal";

const NEXT_PUBLIC_NFT_ADDRESS = process.env.NEXT_PUBLIC_NFT_ADDRESS || "";

export default function Home() {
  const account = useActiveAccount();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [claimedTokenId, setClaimedTokenId] = useState<bigint | undefined>(undefined);

  // Replace the chain with the chain you want to connect to
  const chain = defineChain(sepolia);

  const [quantity, setQuantity] = useState(1);

  // Replace the address with the address of the deployed contract
  const contract = getContract({
    client: client,
    chain: chain,
    address: NEXT_PUBLIC_NFT_ADDRESS
  });

  const { data: contractMetadata, isLoading: isContractMetadataLaoding } = useReadContract(getContractMetadata,
    { contract: contract }
  );

  const { data: claimedSupply, isLoading: isClaimedSupplyLoading } = useReadContract(getTotalClaimedSupply,
    { contract: contract }
  );

  const { data: totalNFTSupply, isLoading: isTotalSupplyLoading } = useReadContract(nextTokenIdToMint,
    { contract: contract }
  );

  const { data: claimCondition } = useReadContract(getActiveClaimCondition,
    { contract: contract }
  );

  const getPrice = (quantity: number) => {
    const total = quantity * parseInt(claimCondition?.pricePerToken.toString() || "0");
    return toEther(BigInt(total));
  }

  const showMintedNFTModal = (tokenId: string) => {
    console.log("totalNFTSupply:", totalNFTSupply);

    setClaimedTokenId(totalNFTSupply);
    setIsModalOpen(true);
  };

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20 text-center">
        <Header />
        <ConnectButton
          client={client}
          chain={chain}
        />
        <div className="flex flex-col items-center mt-4">
          {isContractMetadataLaoding ? (
            <p>Loading...</p>
          ) : (
            <>
              <MediaRenderer
                client={client}
                src={contractMetadata?.image}
                className="rounded-xl"
              />
              <h2 className="text-2xl font-semibold mt-4">
                {contractMetadata?.name}
              </h2>
              <p className="text-lg mt-2">
                {contractMetadata?.description}
              </p>
            </>
          )}
          <TransactionButton
            transaction={() => claimTo({
              contract: contract,
              to: account?.address || "",
              quantity: BigInt(quantity),
            })}
            onTransactionConfirmed={async () => {
              alert("NFT Claimed!");
              showMintedNFTModal("1");
              setQuantity(1);
            }}
            className="mt-4"
          >
            {`Claim NFT (${getPrice(quantity)} ETH)`}
          </TransactionButton>
        </div>
      </div>
      <NFTTransferModal contractAddress={NEXT_PUBLIC_NFT_ADDRESS} open={isModalOpen} onClose={() => setIsModalOpen(false)} tokenId={claimedTokenId as bigint} />
    </main>
  );
}

function Header() {
  return (
    <header className="flex flex-row items-center">
      <Image
        src={thirdwebIcon}
        alt=""
        className="size-[150px] md:size-[150px]"
        style={{
          filter: "drop-shadow(0px 0px 24px #a726a9a8)",
        }}
      />

      <h1 className="text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100">
        NFT Claim App
      </h1>
    </header>
  );
}