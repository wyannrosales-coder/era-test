import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { getApplications, openLogin, signOut, useSession } from '../lib/auth';
import './BookingPage.css';

/** My Account (a prototype): who is signed in and the applications made on this device. */
export default function AccountPage() {
  const session = useSession();
  const apps = session ? getApplications().filter((a) => a.email === session.email) : [];
  return (
    <>
      <Nav tone="cream" />
      <main className="book book--account">
        <p className="book__crumbs"><a href="/">Home</a> / <strong>My Account</strong></p>
        <h1 className="book__title">My Account</h1>
        {session ? (
          <>
            <p className="book__account-email">Signed in as <strong>{session.email}</strong></p>
            <h2 className="book__subtitle">Your applications</h2>
            {apps.length === 0 ? (
              <p>No applications yet. <a className="book__link" href="/find-a-room">Find a room →</a></p>
            ) : (
              <ul className="book-apps">
                {apps.map((a) => (
                  <li key={a.reference} className="book-app">
                    <img src={a.roomImage} alt="" />
                    <div>
                      <h3>{a.roomName}</h3>
                      <p>{a.propertyName} · {a.stayLabel}</p>
                      <p className="book-app__meta">Reference {a.reference} · Received {new Date(a.submittedAt).toLocaleDateString('en-AU')}</p>
                    </div>
                    <span className="book-app__status">In review</span>
                  </li>
                ))}
              </ul>
            )}
            <button type="button" className="book__button book__button--ghost" onClick={signOut}>Log out</button>
          </>
        ) : (
          <>
            <p>Log in to see your applications.</p>
            <button type="button" className="book__button" onClick={() => openLogin()}>Log in</button>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
