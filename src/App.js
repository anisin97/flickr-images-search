import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import useWindiwDimensions from './windowDimensionsHook';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InfiniteScroll from 'react-infinite-scroll-component';
import { MenuItem, InputLabel, Select, FormControl, Grid, Modal, Skeleton } from '@mui/material';

function App() {
  const [isLoading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [searchText, setSearchText] = useState('');
  //const [hasMorePages, setHasMorePages] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchedValues, setSearchedValues] = useState([]);
  // Window dimensions to make Box container of Photos responsive..
  const { windowHeight, windowWidth } = useWindiwDimensions();
  const BASE_URL = "https://www.flickr.com/services/rest/?method=flickr.photos";
  const API_KEY = "7cce000c4217c350639a37c943e93a59";
  const END_URL = "format=json&nojsoncallback=1";
  //State for Image shown in Modal..
  const [displayImage, setDisplayImage] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const handleOpen = () => {setOpenModal(true); return openModal;}
  const handleClose = () => {setOpenModal(false); return openModal;}

  // Function to Fetch more photos during infinite scroll..
  const fetchImages = () => {
    console.log('Fetch Image Called')
    // Infinite scroll for Recent Photos - No search text
    if (searchText === '') {
      fetch(`${BASE_URL}.getRecent&api_key=${API_KEY}&per_page=25&page=${pageNumber + 1}&${END_URL}`)
        .then(response => response.json())
        .then(data => {
          setImages(img => [...img, ...data?.photos?.photo]);
          //setHasMorePages(data?.page < data?.pages ? true : false);
          setPageNumber(pageNo => pageNo + 1);
        }).catch((err) => console.error(err));
    }
    // Infinite Scroll for Searched Photos
    else {
      fetch(`${BASE_URL}.search&api_key=${API_KEY}&text=${searchText}&safe_search=1&per_page=25&page=${pageNumber + 1}&${END_URL}`)
        .then(response => response.json())
        .then(data => {
          setImages(img => [...img, ...data?.photos?.photo]);
          //setHasMorePages(data?.page < data?.pages ? true : false);
          setPageNumber(pageNo => pageNo + 1);
        }).catch((err) => console.error(err));
    }
  };

  //Effect showing first page of recent photos on page load
  useEffect(() => {
    let apiFetch = true;
    if (isLoading && apiFetch) {
      fetch(`${BASE_URL}.getRecent&api_key=${API_KEY}&per_page=25&${END_URL}`)
        .then(response => response.json())
        .then(data => setImages(data?.photos?.photo))
        .catch((err) => console.error(err));
    }
    setLoading(false)
    return () => {
      apiFetch = false;
    };
  }, [isLoading]);

  //Effect showing first page of search results for typed string
  useEffect(() => {
    let apiFetch = true;
    if (searchText !== '' && searchText !== undefined && searchText !== null && apiFetch) {
      fetch(`${BASE_URL}.search&api_key=${API_KEY}&text=${searchText}&safe_search=1&per_page=25&page=1&${END_URL}`).then(
        response => response.json()
      ).then(data => {
        setImages(img =>
          [...data?.photos?.photo]);
        //setHasMorePages(data?.page < data?.pages ? true : false)
      }).catch((err) => console.error(err));
    }
    return () => {
      apiFetch = false;
    };
  }, [searchText]);

  // Call Fetch function to get photos for typed text with 1s delay
  const handleChange = (e) => {
    const timedSearch = setTimeout(setSearchText(e.target.value), 1000);
    clearTimeout(timedSearch)
  }

  // To store all searched terms on hitting Enter as suggestions in browser
  const handleKeyChange = (e) => {
    if (e.key === 'Enter' && e.target.value !== '') {
      setSearchedValues([...searchedValues, e.target.value])
      localStorage.setItem("searchedValues", JSON.stringify(searchedValues))
    }
  }

  // To remove photos with duplicate titles from search options
  const filteredTitles = () => {
    const titles = images?.map(image => image?.title);
    let result = titles.filter((item, index) =>
      titles.indexOf(item) === index
    );
    return result;
  }

  // Style for Modal Box..
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'white',
    border: '2px solid #000',
    boxShadow: 4,
    p: 1,
  };

  return (
    <div className="App">
      <div style={{ position: 'sticky', top: 0, zIndex: 3, backgroundColor: 'lightgrey', color: 'black', paddingBottom: 20, paddingLeft: 60, paddingRight: 60 }}>
        <Grid container spacing={2} direction='row'>
          <Grid item xs={8} >
            {/* SEARCH INPUT */}
            <Autocomplete
              id="free-solo-demo"
              freeSolo
              options={filteredTitles()}
              renderInput={(params) => <TextField {...params} label="Search for photos.."
                value={searchText}
                onChange={handleChange}
                onKeyDown={handleKeyChange}
              />}
              sx={{ backgroundColor: 'white' }}
            />

          </Grid>
          <Grid item xs={4}>
            {/* SUGGESTIONS DROPDOWN */}
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Suggestions</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={searchText}
                onChange={handleChange}
                label="Suggestions"
                sx={{ backgroundColor: 'white' }}
              >
                {searchedValues?.length > 0 && searchedValues?.map((item, index) =>
                  <MenuItem value={item}>{item}</MenuItem>
                )}
              </Select>
            </FormControl>

          </Grid>
        </Grid>
      </div>
      {/* PLACEHOLDER/LOADER */}
      {isLoading &&
        <ImageList variant="masonry" cols={3} gap={50} sx={{ padding: 20 }}>
          <Skeleton variant='rectangular' width={500} height={850} />
        </ImageList>}
        {/* INFINITE SCROLL FOR PHOTOS */}
      <InfiniteScroll
        dataLength={images?.length - 1}
        hasMore={images?.length > 24}
        next={fetchImages}
        loader={
          <ImageList variant="masonry" cols={3} gap={50} sx={{ padding: 20 }}>
            <Skeleton variant='rectangular' width={windowWidth/3} height={850} />
          </ImageList>
        }
        endMessage={!isLoading &&
          <ImageList variant="masonry" cols={3} gap={50} sx={{ padding: 20 }}>
            <Skeleton variant='rectangular' width={windowWidth/3} height={850} />
          </ImageList>
        }
      >
        <Box sx={{ width: { windowWidth }, height: { windowHeight } }}>
          <ImageList variant="masonry" cols={3} gap={50} sx={{ padding: 10 }}>
            {images.map((image, index) => (
              <ImageListItem key={index}>
                <img
                  src={`https://live.staticflickr.com/${image.server}/${image.id}_${image.secret}.jpg`}
                  srcSet={`https://live.staticflickr.com/${image.server}/${image.id}_${image.secret}.jpg`}
                  width={500}
                  height={500}
                  alt={image?.title}
                  loading="lazy"
                  onClick={() => {
                    setDisplayImage(image);
                    handleOpen();
                  }}
                />
                {openModal ? (
                  <Modal
                    open={handleOpen}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                    BackdropProps={{ style: { backgroundColor: "transparent" } }}
                  >
                    <Box sx={style}>
                      <img
                        src={`https://live.staticflickr.com/${displayImage.server}/${displayImage.id}_${displayImage.secret}.jpg`}
                        srcSet={`https://live.staticflickr.com/${displayImage.server}/${displayImage.id}_${displayImage.secret}.jpg`}
                        width={600}
                        height={700}
                        alt={image?.title}
                      />
                    </Box>
                  </Modal>
                ) : null
                }
              </ImageListItem>
            )
            )}
          </ImageList>
        </Box>
      </InfiniteScroll>
    </div >
  );
}

export default App;
