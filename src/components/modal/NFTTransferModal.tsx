import React, { useState } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
} from '@mui/material';
import { styled } from '@mui/system';
import { transferFrom } from "thirdweb/extensions/erc721";
import { TransactionButton, useActiveAccount } from 'thirdweb/react';
import { defineChain, getContract, toEther } from "thirdweb";
import { sepolia } from 'thirdweb/chains';
import { client } from '@/app/client';
// import { useContract, Web3Button } from "@thirdweb-dev/react";

interface NFTTransferModalProps {
    open: boolean;
    onClose: () => void;
    contractAddress: string;
    tokenId: bigint;
}

const StyledModal = styled(Modal)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const ModalContent = styled(Box)(({ theme }) => ({
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '24px',
    width: '90%',
    maxWidth: '400px',
}));

const NFTTransferModal: React.FC<NFTTransferModalProps> = ({
    open,
    onClose,
    contractAddress,
    tokenId,
}) => {
    const [recipientAddress, setRecipientAddress] = useState('');
    const [isTransferring, setIsTransferring] = useState(false);
    const account = useActiveAccount();
    const chain = defineChain(sepolia);

    const contract = getContract({
        client: client,
        chain: chain,
        address: contractAddress
    });

    return (
        <StyledModal open={open} onClose={onClose}>
            <ModalContent>
                <Typography variant="h6" component="h2" color="text.primary" gutterBottom style={{ color: 'black' }}>
                    Transfer Your NFT
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph style={{ color: 'rgba(0, 0, 0, 0.7)' }}>
                    Send your newly claimed NFT to another wallet address.
                </Typography>
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Recipient Wallet Address"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    margin="normal"
                    size='small'
                    InputProps={{
                        style: { color: 'black' }
                    }}
                    InputLabelProps={{
                        style: { color: 'rgba(0, 0, 0, 0.7)' }
                    }}
                />
                <Box mt={2}>
                    <TransactionButton
                        transaction={() => transferFrom({
                            contract: contract,
                            from: account?.address || "",
                            to: recipientAddress || "",
                            tokenId: BigInt(tokenId),
                        })}
                        onTransactionConfirmed={async () => {
                            alert("NFT Transfered Successfully!");
                            onClose();
                        }}
                    >
                        {isTransferring ? <CircularProgress size={24} /> : 'Transfer NFT'}
                    </TransactionButton>
                </Box>
            </ModalContent>
        </StyledModal>
    );
};

export default NFTTransferModal;