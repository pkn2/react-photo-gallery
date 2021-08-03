import React from "react";
import "./Home.css";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";

import Modal from "react-modal";

const customStyles = {
  content: {
    marginTop: "45px",
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

class Header extends React.Component {
  constructor() {
    super();
    this.state = {
      api_key: "a57aef9bc3e5459a0cee4a6f47d3fa8c",
      photos: [], // All images data
      key_word: "", //Searching keyword from user input
      current_page: 0, // Currently which page is open
      total_page: 1, // The total number of pages are available in search result
      is_search: false, // Is user search somethings or not
      is_more: true, // Is there any result left
      searched_key_word: [], // previously searched keyword
      sugg_list: false, // is suggestion list visible
      modalIsOpen: false, // is model open

      model_img_details: {}, // model image details

      api_model: true, // is api model open
    };
  }

  componentDidMount() {
    const { api_key } = this.state;
    axios({
      method: "GET",
      url: `https://www.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=${api_key}&page=1&format=json&nojsoncallback=1`,
      headers: { "Content-Type": "application/json" },
    })
      .then((res) =>
        this.setState({
          photos: res.data.photos.photo,
          current_page: res.data.photos.page,
          total_page: res.data.photos.pages,
        })
      )
      .catch((err) => alert(err));

    const name = localStorage["key_word_search"];

    if (name) {
      // Retrieve
      var stored_key_word_search = JSON.parse(localStorage["key_word_search"]);
      this.setState({ searched_key_word: stored_key_word_search });
    }
    console.log(stored_key_word_search);
  }

  handleChange = (event) => {
    this.setState({ key_word: event.target.value });

    if (!event.target.value) {
      this.setState({ is_search: false });

      axios({
        method: "GET",
        url: `https://www.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=${this.state.api_key}&page=1&format=json&nojsoncallback=1`,
        headers: { "Content-Type": "application/json" },
      })
        .then((res) =>
          this.setState({
            photos: res.data.photos.photo,
            current_page: res.data.photos.page,
            total_page: res.data.photos.pages,
          })
        )
        .catch((err) => alert(err));
    } else {
      this.setState({
        is_search: true,
        photos: [],
        current_page: 0,
        total_page: 0,
        is_more: true,
      });
      axios({
        method: "GET",
        url: `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${this.state.api_key}&tags=${event.target.value}&page=1&format=json&nojsoncallback=1`,
        headers: { "Content-Type": "application/json" },
      })
        .then((res) =>
          this.setState({
            photos: res.data.photos.photo,
            current_page: res.data.photos.page,
            total_page: res.data.photos.pages,
            is_more: true,
            is_search: true,
          })
        )
        .catch((err) => alert(err));
    }
  };

  //On search function
  onSearch_click = (event) => {
    const { key_word, searched_key_word } = this.state;
    event.preventDefault();
    if (!key_word) {
      this.setState({ is_search: false, sugg_list: false });
      alert("Please enter a search keyword.");
    } else {
      this.setState({
        is_search: true,
        photos: [],
        current_page: 0,
        total_page: 1,
        is_more: true,
        sugg_list: false,
      });

      // save intio local storage
      searched_key_word.push(key_word);

      localStorage["key_word_search"] = JSON.stringify(searched_key_word);

      axios({
        method: "GET",
        url: `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${this.state.api_key}&tags=${key_word}&page=1&format=json&nojsoncallback=1`,
        headers: { "Content-Type": "application/json" },
      })
        .then((res) =>
          this.setState({
            photos: res.data.photos.photo,
            current_page: res.data.photos.page,
            total_page: res.data.photos.pages,
            is_more: true,
          })
        )
        .catch((err) => alert(err));
    }
  };

  //  Infinite Scroll function
  onPage_change_inc = () => {
    const { key_word, photos, current_page, total_page } = this.state;
    let next_page = current_page + 1;

    if (this.state.is_search == true && photos.length != 0) {
      axios({
        method: "GET",
        url: `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${this.state.api_key}&tags=${key_word}&page=${next_page}&format=json&nojsoncallback=1`,
        headers: { "Content-Type": "application/json" },
      })
        .then((res) =>
          this.setState({
            photos: [...this.state.photos, ...res.data.photos.photo],
            current_page: res.data.photos.page,
            total_page: res.data.photos.pages,
          })
        )
        .catch((err) => alert(err));
    } else if (photos.length != 0 && total_page != current_page) {
      axios({
        method: "GET",
        url: `https://www.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=${this.state.api_key}&page=${next_page}&format=json&nojsoncallback=1`,
        headers: { "content-Type": "application/json" },
      })
        .then((res) =>
          this.setState({
            photos: [...this.state.photos, ...res.data.photos.photo],
            current_page: res.data.photos.page,
            total_page: res.data.photos.pages,
          })
        )
        .catch((err) => console.log(err));
    } else if (total_page == current_page) {
      this.setState({ is_more: false });
    }
  };

  click_from_render_suggestion = (key_word) => {
    this.setState({
      is_search: true,
      photos: [],
      current_page: 0,
      total_page: 1,
      is_more: true,
      sugg_list: false,
      key_word: key_word,
    });

    axios({
      method: "GET",
      url: `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${
        this.state.api_key
      }&tags=${key_word}&page=${1}&format=json&nojsoncallback=1`,
      headers: { "Content-Type": "application/json" },
    })
      .then((res) =>
        this.setState({
          photos: res.data.photos.photo,
          current_page: res.data.photos.page,
          total_page: res.data.photos.pages,
        })
      )
      .catch((err) => alert(err));
  };

  // list of suggestion
  rendersuggestion = () => {
    let { searched_key_word } = this.state;

    return (
      <div className="sugg_box">
        {searched_key_word.map((item, index) => (
          <React.Fragment>
            <div
              className="padding-5px white"
              key={index}
              onClick={() => this.click_from_render_suggestion(item)}
            >
              {item}
            </div>
            <hr style={{ marginTop: "0px", marginBottom: "0px" }} />
          </React.Fragment>
        ))}
      </div>
    );
  };

  suggestion = () => {
    this.setState({ sugg_list: true });
  };

  openModal = (item) => {
    this.setState({ modalIsOpen: true, model_img_details: item });
  };

  closeModal = () => {
    this.setState({ modalIsOpen: false });
  };

  close_api_Modal = () => {
    this.setState({ api_model: false });
  };

  api_change = (event) => {
    this.setState({ api_key: event.target.value });
  };

  api_model_open = () => {
    this.setState({ api_model: true });
  };

  search_with_new_api_key = (event) => {
    event.preventDefault();
    this.setState({ api_model: false });
    const { api_key } = this.state;
    axios({
      method: "GET",
      url: `https://www.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=${api_key}&page=1&format=json&nojsoncallback=1`,
      headers: { "Content-Type": "application/json" },
    })
      .then((res) =>
        this.setState({
          photos: res.data.photos.photo,
          current_page: res.data.photos.page,
          total_page: res.data.photos.pages,
        })
      )
      .catch((err) => alert(err));
  };

  render() {
    const {
      photos,
      key_word,
      is_more,
      sugg_list,
      modalIsOpen,
      model_img_details,
      api_model,
    } = this.state;
    return (
      <div style={{ backgroundColor: "grey" }}>
        <nav className="sticky-top justify-content-around navbar navbar-dark bg-dark">
          <a className="navbar-brand">Photos</a>
          <div>
            <form>
              <input
                className="border-7px"
                type="text"
                placeholder="Search.."
                value={key_word}
                onChange={this.handleChange}
                onClick={this.suggestion}
              />
              {sugg_list == true ? this.rendersuggestion() : null}
              <button
                className="border-7px search-btn"
                type="submit"
                onClick={this.onSearch_click}
              >
                Search
              </button>
            </form>
          </div>
        </nav>
        <div className="paddingTop-5px">
          <div>
            <InfiniteScroll
              dataLength={photos.length} //This is important field to render the next data
              next={this.onPage_change_inc}
              hasMore={is_more}
              loader={
                <div className="image-cont col-sm-6 colr-md-4 conl-lg-3">
                  <img
                    height="100%"
                    width="100%"
                    alt="image"
                    src={`https://upload.wikimedia.org/wikipedia/commons/b/b9/Youtube_loading_symbol_1_(wobbly).gif`}
                  />
                </div>
              }
              endMessage={
                <div className="image-cont col-sm-6 colr-md-4 conl-lg-3">
                  <img
                    height="100%"
                    width="100%"
                    alt="image"
                    src={`https://media.istockphoto.com/vectors/grunge-red-mission-completed-with-star-icon-round-rubber-seal-stamp-vector-id895660724`}
                  />
                </div>
              }
              className="d-flex flex-wrap justify-content-around"
            >
              {photos &&
                photos.map((item) => {
                  return (
                    <div
                      className="image-cont col-sm-6 colr-md-4 conl-lg-3"
                      onClick={() => this.openModal(item)}
                    >
                      <img
                        height="100%"
                        width="100%"
                        alt="image"
                        src={`https://farm${item.farm}.staticflickr.com/${item.server}/${item.id}_${item.secret}.jpg`}
                      />
                    </div>
                  );
                })}
            </InfiniteScroll>
          </div>
        </div>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Minimal Modal Example"
        >
          <button onClick={this.closeModal}>close</button>

          {model_img_details && model_img_details ? (
            <div>
              <img
                height="100%"
                width="100%"
                alt="image"
                src={`https://farm${model_img_details.farm}.staticflickr.com/${model_img_details.server}/${model_img_details.id}_${model_img_details.secret}.jpg`}
              />
              <div className="text-center"> {model_img_details.title} </div>
            </div>
          ) : null}
        </Modal>
        <div className="d-flex  justify-content-around">
          <h3>This api key may be expired. Enter your own API key</h3>
          <button className="btn btn-success" onClick={this.api_model_open}>
            Enter Api key
          </button>
        </div>

        <Modal
          isOpen={api_model}
          onRequestClose={this.close_api_Modal}
          style={customStyles}
          contentLabel="Minimal Modal Example"
        >
          <button onClick={this.close_api_Modal}>Close</button>

          <form>
            <label>Enter API Key </label>
            <br />
            <br />
            <input type="text" onChange={this.api_change} />
            <br />
            <br />
            <button
              className="btn btn-success"
              onClick={this.search_with_new_api_key}
            >
              Submit
            </button>
          </form>
        </Modal>
      </div>
    );
  }
}

export default Header;
