// Home page
import BlogList from '../components/blogs/BlogList';
import Footer from '../components/common/Footer';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const bar = document.getElementById('progress');
    const onScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (bar) bar.style.width = `${(winScroll / height) * 100}%`;
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div>
      <div className="reading-progress-bar" id="progress" />
      <BlogList />
      <Footer />
    </div>
  );
}
