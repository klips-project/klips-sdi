import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/url-generator">
            URL-Generator Dokumentation
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} Documentation`}
      description="This manual is designed to give a comprehensive overview of the functionalities of the SHOGun-Web-GIS application">
      <HomepageHeader />
      <main>
        <div
          className={styles.grid}
        >
          <p></p>
          <div />
            <p>
              Willkommen bei der Dokumentation zum <b>URL-Generator</b>.
              Der URL-Generator bietet eine Oberfläche um URL's für verschiedene Widgets zu generieren.
              Hier werden alle Widgets vorgestellt und exemplarisch gezeigt, wie diese mit wenigen klicks 
              in eine Webseite integriert werden können.
            </p>
            <h2>Authors:</h2>
            <ul class="authors-list">
              <li>
                Svenja Dobbert (<a href="mailto:dobbert@terrestris.de?subject=URL-Generator">christl@terrestris.de</a>)
              </li>
              <li>
                Fritz Höing (<a href="mailto:hoeing@terrestris.de?subject=URL-Generator">hoeing@terrestris.de</a>)
              </li>
              <li>
                Ulrich Rothstein (<a href="mailto:rothstein@terrestris.de?subject=URL-Generator">blitza@terrestris.de</a>)
              </li>
            </ul>
          <div />
        </div>
      </main>
    </Layout>
  );
}