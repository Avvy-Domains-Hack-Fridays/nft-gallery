import axios from "axios";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Modal from 'react-modal';
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react';
import { Gallery } from './Gallery';
import UserNFTs from "./UserNFTs";

Modal.setAppElement('#root');

function App() {
  const { address, isConnected } = useAccount();
  const [userNFTs,setUserNFTs] = useState([]);
  const [selectedNFT,setSelectedNFT] = useState(null);
  const [selectedSlot,setSelectedSlot] = useState(null);
  const [modalIsOpen, setIsOpen] = useState(false);
  
  const fetchUserNFTs = async (pageToken=null) => {
    if(!isConnected){
      return;
    }
    axios
    .get(`https://glacier-api.avax.network/v1/chains/43114/addresses/${address}/balances:listErc721?pageSize=100${(pageToken ? '&pageToken='+pageToken:'')}`)
    .then(response => {
      console.log(response.data?.erc721TokenBalances)
      const nftdata = response?.data?.erc721TokenBalances
      if(nftdata.length>0){
        let paginatedData = [];

        nftdata.map((nft) => {
          paginatedData.push({
            image: nft.metadata?.imageUri ? nft.metadata.imageUri.replace("ipfs://", "https://ipfs.io/ipfs/"):'/img/notFound.jpg',
            name: nft.metadata.name ? nft.name + ' - ' + nft.metadata.name : nft.name + ' #' + nft.tokenId,
            collectionName: nft.name,
            collectionContract: nft.address,
            tokenId: nft.tokenId
          })
        })
        
        setUserNFTs((previous) => [...previous, ...paginatedData])
        if(nftdata.length == 100 && response.nextPageToken!= ''){
          fetchUserNFTs(response.nextPageToken)
        }
        
      }
    }).catch(function(error) {
      console.log(error);
    });
  }

  const modalStyles = {
    overlay: {
      background: 'rgba(0, 0, 0, 0.3)'
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
      color: '#222'
    },
  };

  function openModal(slotNum) {
    setSelectedSlot(slotNum)
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.

  }

  function closeModal() {
    setIsOpen(false);
  }

  const selectNFT = (nft) => {
    setSelectedNFT(nft)
  }

  useEffect(() => {

    (async () => {
      fetchUserNFTs()
    })()
    
    }, [isConnected]);
  

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
        <Gallery openModal={openModal}/>
      </section>
    </main>
    <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={modalStyles}
        contentLabel="Example Modal"
      >
        <h2 >Select NFT</h2>
        <button className="modal-close-btn" onClick={closeModal}>x</button>
        <br></br>
        <UserNFTs 
          nfts={userNFTs}
          address={address}
          selectNFT={selectNFT}
        />
      </Modal>
    </>
  );
}

export default App;
