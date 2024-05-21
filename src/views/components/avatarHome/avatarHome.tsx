import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { ApprovedAvatarSet } from '../../../clients/s3/S3Agent';
import Carousel from 'react-multi-carousel';
// import 'react-multi-carousel/lib/styles.css';

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 5,
  },
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

  useEffect(() => {
    async function fetchUserAvatarInfo() {
      const response = await fetch('/profile/avatar/getallavatars');
      const data = await response.json();

      // TODO-kev: Remove the loading for this?
      if (data.currentResLink) {
        setCurrentResImgLink(data.currentResLink);
      }
      if (data.currentSpyLink) {
        setCurrentSpyImgLink(data.currentSpyLink);
      }

      setAvatarLibrary(data.avatarLibrary);
    }

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
      <Carousel responsive={responsive}>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
        <div>Item 4</div>
      </Carousel>
      ;
      <div id="approvedAvatars" className="scrollableWindow">
        {avatarLibrary.length === 0 ? (
          <p className={'alignCenter'}>
            Your avatar library is currently empty.
          </p>
        ) : (
          avatarLibrary.map((avatarSet) => (
            <div key={avatarSet.avatarSetId} className="avatarSet">
              <input
                type="radio"
                name="avatarLibrarySet"
                value={avatarSet.avatarSetId}
                onChange={() =>
                  handleChangeAvatarRadio(
                    avatarSet.avatarSetId,
                    avatarSet.resLink,
                    avatarSet.spyLink,
                  )
                }
              />
              <img
                src={avatarSet.resLink}
                alt={`Resistance avatar ${avatarSet.avatarSetId}`}
                className="avatarImg"
              />
              <img
                src={avatarSet.spyLink}
                alt={`Spy avatar ${avatarSet.avatarSetId}`}
                className="avatarImg"
              />
            </div>
          ))
        )}
      </div>
      <br />
      <h4>
        Selected avatar ID:{' '}
        {selectedAvatarId ? selectedAvatarId : 'None selected'}
      </h4>
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
