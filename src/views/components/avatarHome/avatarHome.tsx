import React, { useEffect, useState } from 'react';
import Carousel from 'react-multi-carousel';
import Swal from 'sweetalert2';
import { S3AvatarSet } from '../../../clients/s3/S3Agent';
import { AllAvatarsRouteReturnType } from '../../../routes/profile/avatarRoutes';

const responsive = {
  avatar3: {
    breakpoint: { max: 3000, min: 1098 },
    items: 3,
  },
  avatar2: {
    breakpoint: { max: 1098, min: 732 },
    items: 2,
  },
  avatar1: {
    breakpoint: { max: 732, min: 464 },
    items: 1,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

const GetLinks = {
  getalluseravatars: (username: string) =>
    `/profile/${username}/avatar/getalluseravatars`,
  changeavatar: (username: string) =>
    `/profile/${username}/avatar/changeavatar`,
  customavatar: (username: string) => `/profile/${username}/customavatar`,
  edit: (username: string) => `/profile/${username}/edit`,
};

export function AvatarHome() {
  const [username, setUsername] = useState<string>(null);
  const [currentResImgLink, setCurrentResImgLink] = useState(
    '/avatars/base-res.svg',
  );
  const [currentSpyImgLink, setCurrentSpyImgLink] = useState(
    '/avatars/base-spy.svg',
  );
  const [avatarLibrary, setAvatarLibrary] = useState<S3AvatarSet[]>([]);
  const [selectedAvatarSet, setSelectedAvatarSet] =
    useState<S3AvatarSet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    require('./styles.css');
    require('react-multi-carousel/lib/styles.css');

    // Extract username from route of form '/profile/:profileusername/avatar'
    const match = window.location.pathname.match(/\/profile\/([^\/]+)\/avatar/);
    const extractedUsername = match ? match[1] : '';
    setUsername(extractedUsername);
  }, []);

  useEffect(() => {
    setIsLoading(true);

    if (username) {
      void fetchUserAvatarInfo();
    }

    async function fetchUserAvatarInfo() {
      const response = await fetch(GetLinks.getalluseravatars(username));
      const data: AllAvatarsRouteReturnType = await response.json();

      if (data.currentResLink) {
        setCurrentResImgLink(data.currentResLink);
      }
      if (data.currentSpyLink) {
        setCurrentSpyImgLink(data.currentSpyLink);
      }
      if (data.avatarLibrary) {
        setAvatarLibrary(data.avatarLibrary);
      }

      setIsLoading(false);
    }
  }, [username]);

  const changeAvatarRequest = () => {
    if (!selectedAvatarSet) {
      Swal.fire({
        title: 'No avatar selected.',
        icon: 'error',
      });
      return;
    }

    Swal.fire({
      title: 'Sending request',
      didOpen: async () => {
        Swal.showLoading();
        const response = await fetch(GetLinks.changeavatar(username), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(selectedAvatarSet),
        });

        if (response.status === 200) {
          setCurrentResImgLink(selectedAvatarSet.resLink);
          setCurrentSpyImgLink(selectedAvatarSet.spyLink);
          Swal.close();
          Swal.fire({ title: await response.text(), icon: 'success' });
        } else {
          Swal.close();
          Swal.fire({ title: await response.text(), icon: 'error' });
        }
      },
    });
  };

  const handleClickOnAvatarInLibrary = (avatarSet: S3AvatarSet) => {
    setSelectedAvatarSet(selectedAvatarSet === avatarSet ? null : avatarSet);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <iframe
          src="https://giphy.com/embed/swhRkVYLJDrCE"
          width="480"
          height="270"
          frameBorder="0"
          className="giphy-embed"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  return (
    <div>
      <h1>
        <u>Avatar Home</u>
      </h1>
      <br />
      <h3>Current Avatar Set:</h3>
      <h4>
        This is your current avatar. You may submit a custom avatar request by
        clicking the button below.
      </h4>
      <div className="avatarSet" id="currentAvatarSetDiv">
        <img
          alt="Current Resistance Avatar"
          className="avatarImg"
          src={currentResImgLink}
        ></img>
        <img
          alt="Current Spy Avatar"
          className="avatarImg"
          src={currentSpyImgLink}
        ></img>
      </div>
      <a className="btn btn-info" href={GetLinks.customavatar(username)}>
        Submit a custom avatar
      </a>
      <hr
        style={{
          borderColor: 'lightgrey',
          borderStyle: 'solid',
          margin: '2em',
        }}
      />
      <h3>Avatar Library*: </h3>
      <h4>
        Here are all your approved avatar sets. You can change between avatar
        sets here.
      </h4>
      <br />
      <Carousel
        responsive={responsive}
        containerClass="carousel-container"
        showDots={true}
        keyBoardControl={true}
        removeArrowOnDeviceType={['mobile']}
      >
        {avatarLibrary.length === 0 ? (
          <p className={'alignCenter'}>
            Your avatar library is currently empty.
          </p>
        ) : (
          avatarLibrary.map((avatarSet) => (
            <div
              key={avatarSet.avatarSetId}
              className={`avatarSet ${
                selectedAvatarSet === avatarSet ? 'selected' : ''
              }`}
              onClick={() => handleClickOnAvatarInLibrary(avatarSet)}
            >
              <h3 className="avatarTitle">Avatar {avatarSet.avatarSetId}</h3>
              <img
                src={avatarSet.resLink}
                alt={`Resistance avatar ${avatarSet.avatarSetId}`}
                className="avatarImg"
                draggable={false}
              />
              <img
                src={avatarSet.spyLink}
                alt={`Spy avatar ${avatarSet.avatarSetId}`}
                className="avatarImg"
                draggable={false}
              />
            </div>
          ))
        )}
      </Carousel>
      <br />
      <div className={'align-horizontal'}>
        <button
          className="btn btn-info"
          id="changeAvatarBtn"
          onClick={() => changeAvatarRequest()}
          disabled={!Boolean(selectedAvatarSet)}
        >
          Change avatar
        </button>
        <h4>
          Selected avatar ID:{' '}
          {selectedAvatarSet ? selectedAvatarSet.avatarSetId : 'None selected'}
        </h4>
      </div>

      <h4>*This feature is available to current Patreon supporters.</h4>
      <h4>
        To link your Patreon account or if you would like to support the
        development of the site please do so from your profile page{' '}
        <a href={GetLinks.edit(username)}>here</a>.
      </h4>
    </div>
  );
}
