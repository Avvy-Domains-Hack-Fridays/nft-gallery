import { ConnectButton } from '@rainbow-me/rainbowkit';

export const LandingPage = () => {
  return (
    <>
    <header class="body-font e text-gray-600">
        <div className="container mx-auto flex flex-col flex-wrap items-center p-5 md:flex-row">
            <a className="title-font mb-4 flex items-center font-medium text-gray-900 md:mb-0">
                <span className="ml-1 text-xl">NFT Gallery</span>
            </a>
        </div>
        <nav className="flex flex-wrap items-center justify-center text-base md:ml-auto">
            <ConnectButton />
        </nav>
    </header>
    </>
    
  );
};