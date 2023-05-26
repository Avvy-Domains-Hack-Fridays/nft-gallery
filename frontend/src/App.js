import { ConnectButton } from '@rainbow-me/rainbowkit';
import Modal from 'react-modal';
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react';

function App() {
  const { address, isConnected } = useAccount();
  const [userNFTs,setUserNFTs] = useState([]);
  const [selectedNFT,setSelectedNFT] = useState(null);
  const [galleryNFTs,setGalleryNFTs] = useState([]);
  const [modalIsOpen, setIsOpen] = useState(false);
  let subtitle;
  
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

  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    subtitle.style.color = '#f00';
  }

  function closeModal() {
    setIsOpen(false);
  }

  const selectNFT = (nft) => {
    setSelectedNFT(nft)
  }
  return (
    <>
    <header class="body-font e text-gray-600">
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
      
    </main>
    <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={modalStyles}
        contentLabel="Example Modal"
      >
        <h2 ref={(_subtitle) => (subtitle = _subtitle)}>Select NFT</h2>
        <button className="modal-close-btn" onClick={closeModal}>x</button>
        <br></br>
        
      </Modal>
    </>
  );
}

export default App;
