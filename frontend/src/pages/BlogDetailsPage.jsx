import BlogDetails from '../components/blogs/BlogDetails';
import Footer from '../components/common/Footer';
export default function BlogDetailsPage() {
  return (
    <div>
      <div className="reading-progress-bar" id="progress" />
      <div className="max-w-[1120px] mx-auto px-5 md:px-12 pt-10">
        <BlogDetails />
      </div>
      <Footer />
    </div>
  );
}
