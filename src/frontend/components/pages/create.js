import { ethers } from "ethers";
import React, { Component, useState } from "react";
import Clock from "../components/Clock";
import Footer from '../components/footer';
import MarketplaceAddress from "../../contractsData/Marketplace-address.json";
import MarketplaceAbi from "../../contractsData/Marketplace.json";
import MusicNFTADdress from "../../contractsData/nftMusic-address.json";
import MusicNFTAbi from "../../contractsData/NFTMusic.json";
import { create } from "ipfs-http-client";
const client = create('https://ipfs.infura.io:5001/api/v0');

const Createpage = () => {
  const [ files, setFile ] = useState();
  const [ previewImageUrl, setPreviewImageUrl ] = useState("");
  const [ preplayAudioUrl, setPreplayAudioUrl ] = useState("");

  // const uploadToIPFS = async (file) => {
  //   if (typeof file !== 'undefined') {
  //     try {
  //       const result = await client.add(file)
  //       console.log(result)
  //       // setImage(`https://ipfs.infura.io/ipfs/${result.path}`)
  //     } catch (error){
  //       console.log("ipfs image upload error: ", error)
  //     }
  //   }
  // }

  const onChange = (event) => {
    const file = event.target.files[0];
    const previewImageUrl = URL.createObjectURL(file);
    setPreviewImageUrl(previewImageUrl);
    setFile(file);
  }

  const onChangeAudioFile = async (event) => {
    try {
      const file = event.target.files[0];
      const result = await client.add(file);
      mintThenList(result)
    } catch (error) {
      debugger
    }
  }

  const mintThenList = async (result) => {
    try {
      const uri = `https://ipfs.infura.io/ipfs/${result.path}`
      // mint nft 
  
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner();
  
      const nftContract = new ethers.Contract(MusicNFTADdress.address, MusicNFTAbi.abi, signer);
      let marketplaceContract = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer);
      await(await nftContract.mint(uri)).wait();
  
      // get tokenId of new nft 
      const id = await nftContract.tokenCount()
      // approve marketplace to spend nft
      await(await nftContract.setApprovalForAll(marketplaceContract.address, true)).wait()
      // add nft to marketplace
      const listingPrice = ethers.utils.parseEther("0")
      await(await marketplaceContract.makeItem(nftContract.address, id, listingPrice)).wait();
  
      debugger
    } catch (error) {
      debugger
    }
  }

  const createItem = () => {
    let provider = ethers.getDefaultProvider();
    const signer = provider.getSigner()
    let marketplaceContract = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer);
    marketplaceContract.mint();
  }

    return (
      <div>
        <section className='jumbotron breadcumb no-bg'>
          <div className='mainbreadcumb'>
            <div className='container'>
              <div className='row m-10-hor'>
                <div className='col-12'>
                  <h1 className='text-center'>Create</h1>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='container'>

        <div className="row">
          <div className="col-lg-7 offset-lg-1 mb-5">
              <form id="form-create-item" className="form-border" action="#">
                  <div className="field-set">
                      <h5>Upload Audio</h5>
                      <div className="d-create-file">
                        
                        {/* {files.map(x => 
                          <p key="{index}">PNG, JPG, GIF, WEBP or MP4. Max 200mb.{x.name}</p>
                        )} */}
                        {
                          preplayAudioUrl && (
                            <audio
                              controls
                            >
                              <source
                                  src={preplayAudioUrl}
                                  type="audio/mpeg"
                              />
                            </audio>
                          )
                        }
                        <div className='browse'>
                          <input type="button" id="get_file" className="btn-main" value="Browse"/>
                          <input id='upload_file' type="file" onChange={onChangeAudioFile} />
                        </div>
                      </div>


                      <h5>Upload background</h5>
                      {
                        previewImageUrl
                          ? <div className="wrapper-image-upload"><img src={previewImageUrl || ""} alt="" /></div>
                          : (
                            <div className="d-create-file">
                              <p id="file_name">PNG, JPG, GIF. Max 5Mb.</p>
                              {/* {files.map(x => 
                                <p key="{index}">PNG, JPG, GIF, WEBP or MP4. Max 200mb.{x.name}</p>
                              )} */}
                              <div className='browse'>
                                <input type="button" id="get_file" className="btn-main" value="Browse"/>
                                <input id='upload_file' type="file" onChange={onChange} />
                              </div>
                            </div>
                          )
                      }
                      

                      <div className="spacer-single"></div>

                      <h5>Title</h5>
                      <input type="text" name="item_title" id="item_title" className="form-control" placeholder="e.g. 'Crypto Funk" />

                      <div className="spacer-10"></div>

                      <h5>Description</h5>
                      <textarea data-autoresize name="item_desc" id="item_desc" className="form-control" placeholder="e.g. 'This is very limited item'"></textarea>

                      <div className="spacer-10"></div>

                      <h5>Price</h5>
                      <input type="text" name="item_price" id="item_price" className="form-control" placeholder="enter price for one item (ETH)" />

                      <div className="spacer-10"></div>

                      <h5>Royalties</h5>
                      <input type="text" name="item_royalties" id="item_royalties" className="form-control" placeholder="suggested: 0, 10%, 20%, 30%. Maximum is 70%" />

                      <div className="spacer-10"></div>

                      <input type="button" id="submit" className="btn-main" value="Create Item"/>
                  </div>
              </form>
          </div>

          <div className="col-lg-3 col-sm-6 col-xs-12">
                  <h5>Preview item</h5>
                  <div className="nft__item m-0">
                      <div className="de_countdown">
                        <Clock deadline="December, 30, 2021" />
                      </div>
                      <div className="author_list_pp">
                          <span>                                    
                              <img className="lazy" src="./img/author/author-1.jpg" alt=""/>
                              <i className="fa fa-check"></i>
                          </span>
                      </div>
                      <div className="nft__item_wrap">
                          <span>
                              <img src="./img/collections/coll-item-3.jpg" id="get_file_2" className="lazy nft__item_preview" alt=""/>
                          </span>
                      </div>
                      <div className="nft__item_info">
                          <span >
                              <h4>Pinky Ocean</h4>
                          </span>
                          <div className="nft__item_price">
                              0.08 ETH<span>1/20</span>
                          </div>
                          <div className="nft__item_action">
                              <span>Place a bid</span>
                          </div>
                          <div className="nft__item_like">
                              <i className="fa fa-heart"></i><span>50</span>
                          </div>                            
                      </div> 
                  </div>
              </div>                                         
      </div>

      </section>

        <Footer />
      </div>
   )
}

export default Createpage;