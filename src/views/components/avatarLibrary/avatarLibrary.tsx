import React, { useEffect, useState } from 'react';
import { S3AvatarSet } from '../../../clients/s3/S3Agent';
import Swal from 'sweetalert2';
import Carousel from 'react-multi-carousel';
import { AllUserAvatars } from '../../../routes/profile/profile';

const BASE_RES_AVATAR = '/avatars/base-res.svg';
const BASE_SPY_AVATAR = '/avatars/base-spy.svg';

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 2,
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

export function AvatarLibrary() {
  const [inputUsername, setInputUsername] = useState<string | null>(null);
  const [targetUsername, setTargetUsername] = useState<string | null>(null);
  const [targetUserResAvatar, setTargetUserResAvatar] = useState<string | null>(
    null,
  );
  const [targetUserSpyAvatar, setTargetUserSpyAvatar] = useState<string | null>(
    null,
  );
  const [targetUserAvatarLibrary, setTargetUserAvatarLibrary] = useState<
    S3AvatarSet[] | null
  >(null);
  const [targetUserOtherApprovedAvatars, setTargetUserOtherApprovedAvatars] =
    useState<S3AvatarSet[] | null>(null);

  useEffect(() => {
    require('react-multi-carousel/lib/styles.css');
  }, []);

  const handleGetAvatars = async () => {
    if (!inputUsername) {
      Swal.fire({
        title: 'Please enter a username.',
        icon: 'warning',
      });
      return;
    }

    const response = await fetch(
      `/profile/mod/approvedavatars?username=${inputUsername}`,
    );

    if (response.status === 200) {
      const data: AllUserAvatars = await response.json();
      setTargetUsername(inputUsername);
      setTargetUserResAvatar(
        data.currentResLink ? data.currentResLink : BASE_RES_AVATAR,
      );
      setTargetUserSpyAvatar(
        data.currentSpyLink ? data.currentSpyLink : BASE_SPY_AVATAR,
      );
      setTargetUserAvatarLibrary(data.avatarLibrary);
      setTargetUserOtherApprovedAvatars(data.approvedAvatarsNotInLibrary);
    } else {
      Swal.fire({ title: await response.text(), icon: 'error' });
    }
  };

  return (
    <div>
      <h1>
        <u>User's Avatars:</u>
      </h1>
      <br />
      <div id="approvedAvatarsForUser" className="scrollableWindow alignCenter">
        <p>Here you can see all the approved avatars for a user.</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', width: '333px' }}>
        <input
          type="text"
          name="username"
          className="form-control"
          id="getUserAvatarsInput"
          placeholder="Enter username"
          style={{ marginRight: '10px' }}
          onChange={(e) => setInputUsername(e.target.value)}
        />
        <button
          className="btn btn-warning"
          id="getUserAvatarsButton"
          onClick={handleGetAvatars}
        >
          Get Avatars
        </button>

        {targetUsername ? (
          <button
            className="btn btn-danger"
            id="getUserAvatarsButton"
            style={{ marginLeft: '5px' }}
            onClick={() => setTargetUsername(null)}
          >
            Clear
          </button>
        ) : null}
      </div>

      {targetUsername ? (
        <div>
          <h3>
            <u>{targetUsername}'s current avatar:</u>
          </h3>
          <br />
          <div className="avatarSet" id="currentAvatarSetDiv">
            <img
              alt="Current Resistance Avatar"
              className="avatarImg"
              src={targetUserResAvatar}
            />
            <img
              alt="Current Spy Avatar"
              className="avatarImg"
              src={targetUserSpyAvatar}
            />
          </div>

          {targetUserAvatarLibrary ? (
            <div>
              <h3>
                <u>{targetUsername}'s avatar library:</u>
              </h3>
              <Carousel
                responsive={responsive}
                containerClass="carousel-container"
                showDots={true}
                keyBoardControl={true}
                removeArrowOnDeviceType={['mobile']}
                centerMode={true}
              >
                {targetUserAvatarLibrary.map((avatarSet) => (
                  <div key={avatarSet.avatarSetId} className="avatarSet">
                    <h3 className="avatarTitle">
                      Avatar {avatarSet.avatarSetId}
                    </h3>
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
                ))}
              </Carousel>
            </div>
          ) : null}

          {targetUserOtherApprovedAvatars ? (
            <div>
              <h3>
                <u>{targetUsername}'s other approved avatars:</u>
              </h3>

              <Carousel
                responsive={responsive}
                containerClass="carousel-container"
                showDots={true}
                keyBoardControl={true}
                removeArrowOnDeviceType={['mobile']}
                centerMode={true}
              >
                {targetUserOtherApprovedAvatars.map((avatarSet) => (
                  <div key={avatarSet.avatarSetId} className="avatarSet">
                    <h3 className="avatarTitle">
                      Avatar {avatarSet.avatarSetId}
                    </h3>
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
                ))}
              </Carousel>
            </div>
          ) : null}
        </div>
      ) : null}

      <br />

      {/*TODO-kev: Consider adding a clear button to clear input*/}
      <p>Add in a way to swap between avatars here</p>
    </div>
  );
}
