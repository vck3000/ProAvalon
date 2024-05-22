import React, { useEffect, useState } from 'react';
import Carousel from 'react-multi-carousel';
import Swal from 'sweetalert2';
import { ApprovedAvatarSet } from '../../../clients/s3/S3Agent';

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

export function AvatarHome() {
  const [currentResImgLink, setCurrentResImgLink] = useState(
    '/avatars/base-res.svg',
  );
  const [currentSpyImgLink, setCurrentSpyImgLink] = useState(
    '/avatars/base-spy.svg',
  );
  const [avatarLibrary, setAvatarLibrary] = useState<ApprovedAvatarSet[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null);
  const [selectedAvatarResLink, setSelectedAvatarResLink] = useState<
    string | null
  >(null);
  const [selectedAvatarSpyLink, setSelectedAvatarSpyLink] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    require('react-multi-carousel/lib/styles.css');

    async function fetchUserAvatarInfo() {
      const response = await fetch('/profile/avatar/getallavatars');
      const data = await response.json();

      if (data.currentResLink) {
        setCurrentResImgLink(data.currentResLink);
      }
      if (data.currentSpyLink) {
        setCurrentSpyImgLink(data.currentSpyLink);
      }

      setAvatarLibrary(data.avatarLibrary);
      setIsLoading(false);
    }

    setIsLoading(true);
    void fetchUserAvatarInfo();
  }, []);

  const changeAvatarRequest = () => {
    if (!selectedAvatarId) {
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
        const response = await fetch('/profile/avatar/changeavatar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            avatarId: selectedAvatarId,
            resLink: selectedAvatarResLink,
            spyLink: selectedAvatarSpyLink,
          }),
        });

        if (response.status === 200) {
          setCurrentResImgLink(selectedAvatarResLink);
          setCurrentSpyImgLink(selectedAvatarSpyLink);
          Swal.close();
          Swal.fire({ title: await response.text(), icon: 'success' });
        } else {
          Swal.close();
          Swal.fire({ title: await response.text(), icon: 'error' });
        }
      },
    });
  };

  const handleChangeAvatarRadio = (
    avatarSetId: number,
    resLink: string,
    spyLink: string,
  ) => {
    setSelectedAvatarId(avatarSetId);
    setSelectedAvatarResLink(resLink);
    setSelectedAvatarSpyLink(spyLink);
  };

  const handleClickOnAvatarInLibrary = (avatarSet: ApprovedAvatarSet) => {
    setSelectedAvatarId(avatarSet.avatarSetId);
    setSelectedAvatarResLink(avatarSet.resLink);
    setSelectedAvatarSpyLink(avatarSet.spyLink);
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
      <a className="btn btn-info" href="/profile/customavatar/redirect">
        Submit a custom Avatar
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
        infinite={true}
        containerClass="carousel-container"
        showDots={true}
        keyBoardControl={true}
        focusOnSelect={true}
        removeArrowOnDeviceType={['mobile']}
        centerMode={true}
      >
        {avatarLibrary.length === 0 ? (
          <p className={'alignCenter'}>
            Your avatar library is currently empty.
          </p>
        ) : (
          avatarLibrary.map((avatarSet) => (
            <div
              key={avatarSet.avatarSetId}
              className="avatarSet"
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
      <h4>
        Selected avatar ID:{' '}
        {selectedAvatarId ? selectedAvatarId : 'None selected'}
      </h4>
      <br />
      <a
        className="btn btn-info"
        id="changeAvatarBtn"
        onClick={() => changeAvatarRequest()}
      >
        Change avatar
      </a>
      <h4>*This feature is available to current Patreon supporters.</h4>
      <h4>
        To link your Patreon account or if you would like to support the
        development of the site please do so from your profile page{' '}
        <a href="/profile/edit/redirect">here</a>.
      </h4>
    </div>
  );
}
