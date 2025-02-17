import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from '../components/Home.module.css'
import { Trans, useTranslation } from 'react-i18next'

import pibox2Mini from '../public/images/box-2-mini.png'
import pibox5 from '../public/images/box-5.png'
import piboxSpinning from '../public/images/pibox-360-full.gif'
import piboxLeaning from '../public/images/pibox-carrier-leaning.png'
import piboxSSDRemoval from '../public/images/pibox-ssd-removal.png'
import piboxNextCloud from '../public/images/nextcloud.png'
import ditchIcons from '../public/images/ditch-icons.png'
import plexDemo from '../public/images/lion.png'

const Home = () => {
  const [email, setEmail] = useState('')
  const [model, setModel] = useState('box2mini')

  const { t } = useTranslation()

  useEffect(() => {
    email && window.localStorage.setItem('email', email)
  }, [email])

  return (
    <div>
      <div className={styles.Product}>
        <div className={[styles.SectionInner]}>
          <div className={styles.ProductContent}>
            <div className={styles.ProductHero}>
              <Image
                layout={'responsive'}
                alt="PiBox Render"
                src={model === 'box2mini' ? pibox2Mini : pibox5}
              />
              <div className={styles.divider}></div>
              <div className={styles.ProductBar}>
                <div>
                  <div
                    className={[
                      styles.ProductTab,
                      styles.pinkTab,
                      model === 'box2mini' && styles.ProductTabSelected,
                    ].join(' ')}
                    onClick={() => {
                      setModel('box2mini')
                    }}
                  >
                    <div>PiBox</div>
                    <div className={styles.colorPink}>{t('box2-description')}</div>
                  </div>
                </div>
                <div className={[styles.five].join(' ')}>
                  <div
                    className={[
                      styles.ProductTab,
                      styles.blueTab,
                      model === 'box5' && styles.ProductTabSelected,
                    ].join(' ')}
                    onClick={() => {
                      setModel('box5')
                    }}
                  >
                    <div>PiBox</div>
                    <span className={styles.colorBlue}>{t('box5-description')}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.ProductContentContainer}>
              <h2 className={styles.HeroHeader}>{t('hero-header')}</h2>
              <div className={styles.ProductFeatureText}>
                <span>{t('Just add:')}</span>
                <ul className={styles.ul}>
                  <li>
                    <Trans i18nKey="raspberry-pi-cm4">
                      A
                      <a
                        href="https://www.raspberrypi.org/products/compute-module-4/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Raspberry Pi CM4
                      </a>
                    </Trans>
                  </li>
                  <li>{t('A few hard drives')}</li>
                  <li>{t('Any pi supported OS')}</li>
                </ul>{' '}
                <span>{t('versatile-storage')}</span>
              </div>
              <Link href="/order">
                <a className={styles.largeButton}>{t('Order Now!')}</a>
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.Section}>
          <div className={[styles.SectionInner, styles.SectionReverse].join(' ')}>
            <div className={styles.SectionCopy}>
              <h3>{t('operating-systems')}</h3>
              <div className={[styles.IconContainer, styles.IconsOS].join(' ')}>
                <img
                  className={styles.Icons}
                  src="/images/ubuntu.png"
                  alt="Ubuntu"
                  style={{ marginRight: 30 }}
                  loading="lazy"
                />
                <img
                  className={styles.Icons}
                  src="/images/raspberry.png"
                  alt="Raspberry Pi"
                  loading="lazy"
                />
              </div>
              <p className={styles.SectionText}>{t('finally-a-nas')}</p>
            </div>
            <img
              className={styles.SectionImg}
              src="/images/gorilla.png"
              alt="Image of Desktop"
              loading="lazy"
            />
          </div>
        </div>
        <div className={styles.Section}>
          <div className={styles.SectionInner}>
            <Image
              width={600}
              height={415}
              alt="PiBox can run Home-Media software like Plex and JellyFin without a sweat!"
              src={plexDemo}
              className={styles.SectionImg}
            />
            <div className={styles.SectionCopy}>
              <h3>{t('HDMI for Media')}</h3>
              <div className={[styles.IconContainer, styles.IconsHDMI].join(' ')}>
                <img
                  className={styles.Icons}
                  src="/images/hdmi.png"
                  alt="HDMI Icon"
                  loading="lazy"
                />
              </div>
              <p className={styles.SectionText}>{t('pibox-media-center')}</p>
            </div>
          </div>
        </div>
        <div className={styles.Section}>
          <div className={[styles.SectionInner, styles.SectionReverse].join(' ')}>
            <div className={styles.SectionCopy}>
              <h3>{t('ditch-big-cloud')}</h3>
              <div className={[styles.IconContainer, styles.IconsDitch].join(' ')}>
                <img alt="Ditch icons" src={ditchIcons.src} className={styles.Icons} />
              </div>
              <p className={styles.SectionText}>
                <Trans i18nKey="pibox-templates-pitch">
                  PiBox is ready to run a variety of free software.
                  <a href="https://kubesail.com/templates/" target="_blank">
                    Templates
                  </a>
                  let you spin up self-hosted apps with one click.
                </Trans>
              </p>
            </div>
            <Image
              width={620}
              height={450}
              alt="PiBox can run loads of software, like NextCloud!"
              src={piboxNextCloud}
              className={styles.SectionImg}
            />
          </div>
        </div>

        <div className={styles.SlideShowImg}>
          <Image
            layout={'responsive'}
            alt="PiBox is flexable - add your own SSDs"
            src={piboxSSDRemoval}
            className={styles.SlideShowImg}
          />
        </div>

        <div className={styles.CTA}>
          <Link href="/order">
            <a className={styles.largeButton} style={{ maxWidth: 800 }}>
              {t('Order Now!')}
            </a>
          </Link>
        </div>
      </div>

      <div className={styles.SlideShowImg}>
        <Image
          layout={'responsive'}
          alt="PiBox Spinning"
          src={piboxSpinning}
          className={styles.SlideShowImg}
        />
      </div>

      <div className={styles.SlideShowImg}>
        <Image
          layout={'responsive'}
          alt="PiBox Leaning"
          src={piboxLeaning}
          className={styles.SlideShowImg}
        />
      </div>

      {/* <p>You are in {country}</p> */}
    </div>
  )
}

export default Home
