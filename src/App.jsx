import { useEffect, useState } from "react";
import "./App.css";
import SearchBar from "./components/SearchBar/SearchBar";
import ImageGallery from "./components/ImageGallery/ImageGallery";
import ErrorMessage from "./components/ErrorMessage/ErrorMessage";
import Loader from "./components/Loader/Loader";
import LoadMoreBtn from "./components/LoadMoreBtn/LoadMoreBtn";
import fetchImages from "./components/fetchImages/fetchImages";
import EndOfImages from "./components/EndOfImages/EndOfImages";
import ImageModal from "./components/ImageModal/ImageModal";

function App() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState("");
  const [endOfCollection, setEndOfCollection] = useState(false);
  const [hasLoadedImages, setHasLoadedImages] = useState(false);
  const [totalCollection, setTotalCollection] = useState({});
  const [totalImages, setTotalImages] = useState(0);

  const handleOpenModal = (imageUrl) => {
    setSelectedImages(imageUrl);
    setIsOpen(true);
  };
  const handleCloseModal = () => {
    setSelectedImages("");
    setIsOpen(false);
  };

  const handleSearch = async (searchTerm) => {
    try {
      setImages([]);
      setLoading(true);
      setError(false);
      setPage(1);
      setSearchTerm(searchTerm);
      const data = await fetchImages(searchTerm);
      setImages(data.results);
      setTotalCollection(data.total);
      setEndOfCollection(false);
      setHasLoadedImages(true);
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchTotalImages = async () => {
      const total = Math.ceil(totalCollection / 15);
      setTotalImages(total);
    };

    fetchTotalImages();
  }, [totalCollection]);
  useEffect(() => {
    if (page >= totalImages) {
      setEndOfCollection(true);
    } else {
      setEndOfCollection(false);
    }
  }, [page, totalImages]);
  const handleLoadMore = async () => {
    try {
      setLoading(true);
      const nextPageData = await fetchImages(searchTerm, page + 1);
      setPage((prevPage) => prevPage + 1);
      setImages((prevImages) => [...prevImages, ...nextPageData.results]);
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <SearchBar onSearch={handleSearch} />
      {images.length > 0 && (
        <ImageGallery images={images} isOpen={handleOpenModal} />
      )}
      {endOfCollection && hasLoadedImages && <EndOfImages />}
      {error && <ErrorMessage searchTerm={searchTerm} setError={setError} />}
      {loading && <Loader />}
      {images.length > 0 && !endOfCollection && (
        <LoadMoreBtn onChange={handleLoadMore} />
      )}
      <ImageModal
        images={images}
        isOpen={isOpen}
        isClose={handleCloseModal}
        imageUrl={selectedImages}
      />
    </>
  );
}

export default App;
