import { Fragment, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Nav from '../components/Nav';
import BlogCard from '../components/blog/BlogCard';
import WhyLiving from '../components/why/WhyLiving';
import AboutClosing from '../components/about/AboutClosing';
import Footer from '../components/Footer';
import ToTop from '../components/ToTop';
import { scrollToY } from '../lib/smoothScroll';
import { POSTS, postMeta } from '../components/blog/blogData';
import type { Audience, BlogPost } from '../components/blog/blogData';
import linkIcon from '../assets/blog/share-link.svg';
import tiktok from '../assets/blog/share-tiktok.svg';
import facebook from '../assets/blog/share-facebook.svg';
import instagram from '../assets/blog/share-instagram.svg';
import dropdownIcon from '../assets/blog/section-dropdown.svg';
import shareIcon from '../assets/blog/share-network.svg';
import '../components/blog/Blog.css';

const sectionId = (i: number) => `section-${i + 1}`;

/**
 * A blog post (Figma 1097:20129): breadcrumbs, the article beside a sticky panel with
 * its contents and share links, then three related posts, the "Write your story" band
 * and the footer. The contents follow the reading position — the bronze mark on the bar
 * sits beside the section in view — and jump to a section when clicked.
 */
export default function BlogPostPage({ post, audience }: { post: BlogPost; audience: Audience }) {
  const [current, setCurrent] = useState(0);
  const [copied, setCopied] = useState(false);
  const [barShown, setBarShown] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const related = POSTS.filter((p) => p.audience === post.audience && p.slug !== post.slug).slice(0, 3);

  // The section in view: the last whose heading has passed a third of the way down.
  // Phones: the section bar shows from the title's passing under the nav to the article's end.
  useEffect(() => {
    const update = () => {
      const heads = articleRef.current?.querySelectorAll<HTMLElement>('.blog-post__section-title');
      if (!heads) return;
      let i = 0;
      heads.forEach((h, n) => {
        if (h.getBoundingClientRect().top <= window.innerHeight / 3) i = n;
      });
      setCurrent(i);
      const header = headerRef.current?.getBoundingClientRect();
      const main = mainRef.current?.getBoundingClientRect();
      setBarShown(!!header && !!main && header.bottom < 64 && main.bottom > 64 + (barRef.current?.offsetHeight ?? 0));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const goTo = (i: number) => {
    const el = document.getElementById(sectionId(i));
    if (!el) return;
    const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-offset')) || 88;
    // Phones: clear the section bar too (it's not displayed on larger screens)
    const bar = barRef.current?.offsetParent ? barRef.current.offsetHeight : 0;
    scrollToY(el.getBoundingClientRect().top + window.scrollY - nav - bar - 32);
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: post.title, url: window.location.href });
      else await copyLink();
    } catch {
      // Sharing cancelled: nothing to do
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. an insecure context): nothing to copy to
    }
  };

  const shareUrl = encodeURIComponent(window.location.href);

  // In the side panel, and on phones below the article instead
  const sharePanel = (
    <>
      <p className="eyebrow blog-post__label">Share</p>
      <ul className="blog-post__share">
        <li>
          <button type="button" aria-label="Copy link" onClick={copyLink}>
            <img src={linkIcon} width={24} height={24} alt="" />
          </button>
        </li>
        <li>
          <a href="#" aria-label="TikTok">
            <img src={tiktok} width={24} height={24} alt="" />
          </a>
        </li>
        <li>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Facebook"
          >
            <img src={facebook} width={24} height={24} alt="" />
          </a>
        </li>
        <li>
          <a href="#" aria-label="Instagram">
            <img src={instagram} width={24} height={24} alt="" />
          </a>
        </li>
      </ul>
      <p className="blog-post__copied" role="status">
        {copied ? 'Link copied' : ''}
      </p>
    </>
  );

  return (
    <>
      <Nav tone="cream" />
      {/* Phones (Figma 1361:27930): the section in view, to jump between them, and sharing */}
      <div
        ref={barRef}
        className={`blog-post__bar${barShown ? ' is-shown' : ''}`}
        aria-hidden={!barShown}
      >
        <label className="blog-post__jump">
          <span className="visually-hidden">Jump to section</span>
          <select value={current} onChange={(e) => goTo(Number(e.target.value))}>
            {post.sections.map((s, i) => (
              <option key={s.title} value={i}>
                {s.title}
              </option>
            ))}
          </select>
          <img src={dropdownIcon} width={24} height={24} alt="" />
        </label>
        <button type="button" className="blog-post__bar-share" aria-label="Share" onClick={share}>
          <img src={shareIcon} width={24} height={24} alt="" />
        </button>
      </div>
      <main>
        <section className="blog-post">
          <nav className="blog-post__crumbs" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden>/</span>
            <span>Life @ EPIISOD</span>
            <span aria-hidden>/</span>
            <a href={`/blog/${audience.id}`}>Blogs {audience.label.toLowerCase()}</a>
            <span aria-hidden>/</span>
            <span aria-current="page">Blog content</span>
          </nav>

          <div ref={mainRef} className="blog-post__main">
            <article ref={articleRef} className="blog-post__article">
              <header ref={headerRef} className="blog-post__header">
                <h1 className="type-h3 blog-post__title">{post.title}</h1>
                <p className="blog-meta">{postMeta(post)}</p>
              </header>
              <img
                className="blog-post__image"
                src={post.image}
                style={{ objectPosition: post.imagePosition }}
                alt=""
              />
              {post.sections.map((s, i) => (
                <Fragment key={s.title}>
                  <div className="blog-post__section" id={sectionId(i)}>
                    <h2 className="blog-post__section-title">{s.title}</h2>
                    {s.paragraphs.map((text, n) => (
                      <p key={n} className="type-body-l blog-post__paragraph">
                        {text}
                      </p>
                    ))}
                  </div>
                  {i === 1 && post.inlineImage && (
                    <img className="blog-post__image" src={post.inlineImage} alt="" />
                  )}
                </Fragment>
              ))}
            </article>

            <aside className="blog-post__aside">
              <div className="blog-post__panel">
                <p className="eyebrow blog-post__label">Contents</p>
                <div className="blog-post__contents">
                  <span
                    className="blog-post__contents-bar"
                    aria-hidden
                    style={{ '--i': current, '--n': post.sections.length } as CSSProperties}
                  />
                  <ul>
                    {post.sections.map((s, i) => (
                      <li key={s.title}>
                        <button
                          type="button"
                          className={i === current ? 'is-current' : ''}
                          aria-current={i === current ? 'location' : undefined}
                          onClick={() => goTo(i)}
                        >
                          {s.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="blog-post__panel">{sharePanel}</div>
            </aside>
          </div>

          <div className="blog-post__panel blog-post__share-end">{sharePanel}</div>

          {related.length > 0 && (
            <div className="blog-post__related">
              <h2 className="type-h3">
                Related <em>blogs</em>
              </h2>
              <div className="blog-grid">
                {related.map((p) => (
                  <BlogCard key={p.slug} post={p} />
                ))}
              </div>
            </div>
          )}
        </section>
        <WhyLiving />
        <AboutClosing />
      </main>
      <Footer />
      <ToTop />
    </>
  );
}
