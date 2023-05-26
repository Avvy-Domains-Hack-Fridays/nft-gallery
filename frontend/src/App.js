import axios from 'axios'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Modal from 'react-modal'
import { useNetwork, useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { Gallery } from './Gallery'
import UserNFTs from './UserNFTs'
import Booking from './Booking'
import ABI from './ABI.json'
import { ethers } from 'ethers'
import AVVY from '@avvy/client'
import { useWalletClient } from 'wagmi'
import { getContract } from 'viem'

import 'react-datepicker/dist/react-datepicker.css'

Modal.setAppElement('#root')

function App() {
  const { address, isConnected } = useAccount()
  const [userNFTs, setUserNFTs] = useState([])
  const [selectedNFT, setSelectedNFT] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [modalIsOpen, setIsOpen] = useState(false)
  const [bookingReferenceTime, setBookingReferenceTime] = useState(null)
  const [bookingIntervalSize, setBookingIntervalSize] = useState(null)
  const [step, setStep] = useState(1)
  const [owner, setOwner] = useState(null)

  const { chain } = useNetwork()
  let chainData
  let contract
  let viemContract
  const mainnetProvider = new ethers.JsonRpcProvider(
    'https://api.avax.network/ext/bc/C/rpc'
  )
  const { data: walletClient, isError, isLoading } = useWalletClient()
  if (chain) {
    chainData = ABI[chain.id][0]
    const contractProvider = new ethers.JsonRpcProvider(
      chain.id === 43113
        ? 'https://api.avax-test.network/ext/bc/C/rpc'
        : 'https://api.avax.network/ext/bc/C/rpc'
    )
    const contractAddress = chainData.contracts.Rental.address
    const contractAbi = chainData.contracts.Rental.abi
    contract = new ethers.Contract(
      contractAddress,
      contractAbi,
      contractProvider
    )

    if (walletClient) {
      viemContract = getContract({
        address: contractAddress,
        abi: contractAbi,
        walletClient,
      })
    }
  }
  const avvy = new AVVY(mainnetProvider)
  useEffect(() => {
    let active = true
    const run = async () => {
      if (contract) {
        const res = await Promise.all([
          contract.bookingReferenceTime(),
          contract.bookingIntervalSize(),
          contract.owner(),
        ])
        setBookingReferenceTime(res[0])
        setBookingIntervalSize(res[1])
        setOwner(res[2])
      }
    }
    if (active) {
      run()
    }
    return () => {
      active = false
    }
  }, [contract])

  const getOffset = (epoch) => {
    const _bookingReferenceTime = parseInt(bookingReferenceTime)
    const _bookingIntervalSize = parseInt(bookingIntervalSize)
    const intervalOffset = parseInt(
      (epoch - _bookingReferenceTime) / _bookingIntervalSize
    )
    return intervalOffset
  }

  const getCurrentOffset = () => {
    const now = parseInt(new Date().getTime() / 1000)
    return getOffset(now)
  }

  const fetchUserNFTs = async (pageToken = null) => {
    if (!isConnected) {
      return
    }
    axios
      .get(
        `https://glacier-api.avax.network/v1/chains/43114/addresses/${address}/balances:listErc721?pageSize=100${
          pageToken ? '&pageToken=' + pageToken : ''
        }`
      )
      .then((response) => {
        console.log(response.data?.erc721TokenBalances)
        const nftdata = response?.data?.erc721TokenBalances
        if (nftdata.length > 0) {
          let paginatedData = []

          nftdata.map((nft) => {
            paginatedData.push({
              image: nft.metadata?.imageUri
                ? nft.metadata.imageUri.replace(
                    'ipfs://',
                    'https://ipfs.io/ipfs/'
                  )
                : null,
              name: nft.metadata.name
                ? nft.name + ' - ' + nft.metadata.name
                : nft.name + ' #' + nft.tokenId,
              collectionName: nft.name,
              collectionContract: nft.address,
              tokenId: nft.tokenId,
              tokenUri: nft.tokenUri,
            })
          })

          setUserNFTs((previous) => [...previous, ...paginatedData])
          if (nftdata.length == 100 && response.nextPageToken != '') {
            fetchUserNFTs(response.nextPageToken)
          }
        }
      })
      .catch(function (error) {
        console.log(error)
      })
  }

  const modalStyles = {
    overlay: {
      background: 'rgba(0, 0, 0, 0.3)',
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      minWidth: '480px',
      width: '50%',
      color: '#222',
    },
  }

  function openModal(slotNum) {
    setSelectedSlot(slotNum)
    setIsOpen(true)
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
  }

  function closeModal() {
    setIsOpen(false)
  }

  const selectNFT = (nft) => {
    setSelectedNFT(nft)
  }

  useEffect(() => {
    ;(async () => {
      fetchUserNFTs()
    })()
  }, [isConnected])

  return (
    <>
      <header className="body-font e text-gray-600">
        <div className="container mx-auto flex flex-col flex-wrap items-center p-5 md:flex-row">
          <a className="title-font mb-4 flex items-center font-medium text-gray-900 md:mb-0">
            <span className="ml-1 text-xl">NFT Gallery</span>
          </a>
          <nav className="flex flex-wrap items-center justify-center text-base md:ml-auto">
            <ConnectButton />
          </nav>
        </div>
      </header>
      <main>
        <section className="body-font text-gray-600">
          <Gallery mainnetEthersProvider={mainnetProvider} getCurrentOffset={getCurrentOffset} openModal={openModal} owner={owner} address={address} contract={contract} viemContract={viemContract} bookingReferenceTime={bookingReferenceTime} />
        </section>
      </main>
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={modalStyles}
        contentLabel="Example Modal"
      >
        <h2>Select NFT</h2>
        <button className="modal-close-btn" onClick={closeModal}>
          x
        </button>
        <br></br>
        {step == 1 ? (
          <UserNFTs
            nfts={userNFTs}
            address={address}
            selectedNFT={selectedNFT}
            selectNFT={selectNFT}
            setStep={setStep}
          />
        ) : step === 2 ? (
          <>
            <p>step 2</p>
            <Booking
              viemContract={viemContract}
              contract={contract}
              goBack={() => setStep(1)}
              selectedSlot={selectedSlot}
              selectedNFT={selectedNFT}
              bookingReferenceTime={bookingReferenceTime}
              bookingIntervalSize={bookingIntervalSize}
              getCurrentOffset={getCurrentOffset}
              getOffset={getOffset}
            />
          </>
        ) : (
          <div>Step 3</div>
        )}
      </Modal>
    </>
  )
}

export default App
