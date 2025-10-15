import { Fragment, FunctionComponent, MouseEvent, SVGProps } from 'react';
import { ReactComponent as ArrowUpRightIcon } from 'assets/icons/arrow-up-right-icon.svg';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import {
  useHandleThemeManagement,
  ThemeOptionType
} from 'hooks/useHandleThemeManagement';
import { ReactComponent as HomeLightThemeIcon } from 'assets/img/bright-light-icon.svg';
import { ReactComponent as HomeVibeThemeIcon } from 'assets/img/vibe-mode-icon.svg';
import { ReactComponent as HomeDarkThemeIcon } from 'assets/icons/home-dark-theme-icon.svg';
import { Button } from 'components';
import { DOCUMENTATION_LINK, RouteNamesEnum } from 'localConstants';

import styles from './homeHero.styles';

interface HomeThemeOptionType extends ThemeOptionType {
  icon: FunctionComponent<SVGProps<SVGSVGElement>>;
  backgroundClass: string;
  title: string;
}

const themeExtraProperties: Record<
  string,
  Omit<HomeThemeOptionType, keyof ThemeOptionType>
> = {
  'mvx:dark-theme': {
    icon: HomeDarkThemeIcon,
    title: 'Élégante',
    backgroundClass: 'bg-dark-theme'
  },
  'mvx:light-theme': {
    icon: HomeLightThemeIcon,
    title: 'Luxueuse',
    backgroundClass: 'bg-light-theme'
  },
  'mvx:vibe-theme': {
    icon: HomeVibeThemeIcon,
    title: 'Dynamique',
    backgroundClass: 'bg-vibe-theme'
  }
};

export const HomeHero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { allThemeOptions, activeTheme, handleThemeSwitch } =
    useHandleThemeManagement();

  const handleLogIn = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    navigate(RouteNamesEnum.unlock);
  };

  const homeThemeOptions: HomeThemeOptionType[] = allThemeOptions.map(
    (option) => ({
      ...option,
      ...themeExtraProperties[option.identifier]
    })
  );

  const activeHomeTheme = activeTheme
    ? { ...activeTheme, ...themeExtraProperties[activeTheme.identifier] }
    : null;

  const heroContainerClasses = activeHomeTheme
    ? classNames(styles.heroContainer, activeHomeTheme.backgroundClass)
    : styles.heroContainer;

  return (
    <div className={heroContainerClasses}>
      <div className={styles.heroSectionTop}>
        <div className={styles.heroSectionTopContent}>
          <h1 className={styles.heroTitle}>{t('home.title')}</h1>

          <p className={styles.heroDescription}>
            {t('home.description')}
          </p>
        </div>

        <div className={styles.heroSectionTopButtons}>
          <Button onClick={handleLogIn}>{t('home.connectWallet')}</Button>

          <a
            target='_blank'
            rel='noreferrer'
            href='/docs/ARCHITECTURE.md'
            className={styles.heroSectionTopDocButton}
          >
            <span className={styles.heroSectionTopDocButtonText}>
              {t('home.learnMore')}
            </span>

            <ArrowUpRightIcon />
          </a>
        </div>
      </div>

      {activeHomeTheme && (
        <div className={styles.heroSectionBottom}>
          {homeThemeOptions.map((themeOption) => (
            <div
              key={themeOption.identifier}
              onClick={handleThemeSwitch(themeOption.identifier)}
              className={classNames(styles.heroSectionBottomThemeOptions, {
                [styles.heroSectionBottomThemeOptionsOpacityFull]:
                  themeOption.identifier === activeHomeTheme.identifier
              })}
            >
              <div className={styles.heroSectionBottomThemeOption}>
                <themeOption.icon className={styles.themeOptionIcon} />

                <span className={styles.themeOptionTitle}>
                  {themeOption.label}
                </span>
              </div>

              {themeOption.identifier === activeHomeTheme.identifier && (
                <Fragment>
                  <span className={styles.themeOptionActiveDot} />

                  <div className={styles.themeOptionActiveLabel}>
                    {themeOption.title}
                  </div>
                </Fragment>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
