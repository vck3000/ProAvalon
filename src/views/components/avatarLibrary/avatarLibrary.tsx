import React, { useEffect, useState } from 'react';
import { AllApprovedAvatars, S3AvatarSet } from '../../../clients/s3/S3Agent';
import Swal from 'sweetalert2';
import Carousel from 'react-multi-carousel';
import { AllAvatarsRouteReturnType } from '../../../routes/profile/avatarRoutes';

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

export function AvatarLibrary() {
  const [usernameToSearchAvatar, setUsernameToSearchAvatar] = useState<
    string | null
  >(null);
  const [approvedAvatarsNotInLibrary, setApprovedAvatarsNotInLibrary] =
    useState<S3AvatarSet[] | null>(null);
  const [avatarLibrary, setAvatarLibrary] = useState<S3AvatarSet[] | null>(
    null,
  );

  useEffect(() => {
    require('react-multi-carousel/lib/styles.css');
  }, []);

  const handleGetAvatars = async () => {
    if (!usernameToSearchAvatar) {
      Swal.fire({
        title: 'Please enter a username.',
        icon: 'warning',
      });
      return;
    }

    const response = await fetch(
      `/profile/mod/approvedavatars?username=${usernameToSearchAvatar}`,
    );

    if (response.status === 200) {
      const data: AllApprovedAvatars = await response.json();
      setAvatarLibrary(data.avatarLibrary);
      setApprovedAvatarsNotInLibrary(data.approvedAvatarsNotInLibrary);
    } else {
      Swal.fire({ title: await response.text(), icon: 'error' });
    }
  };

  return (
    <div>
      <h1>
        <u>Approved Avatars for a User:</u>
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
          onChange={(e) => setUsernameToSearchAvatar(e.target.value)}
        />
        <button
          className="btn btn-warning"
          id="getUserAvatarsButton"
          onClick={handleGetAvatars}
        >
          Get Avatars
        </button>
      </div>

      <h3>
        <u>User 1's avatar library:</u>
      </h3>
      <Carousel
        responsive={responsive}
        containerClass="carousel-container"
        showDots={true}
        keyBoardControl={true}
        removeArrowOnDeviceType={['mobile']}
        centerMode={true}
      >
        {!avatarLibrary || avatarLibrary.length === 0 ? (
          <p className={'alignCenter'}>
            Your avatar library is currently empty.
          </p>
        ) : (
          avatarLibrary.map((avatarSet) => (
            <div key={avatarSet.avatarSetId} className="avatarSet">
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

      <h3>
        <u>User 1's approved avatars not in their library:</u>
      </h3>
      <Carousel
        responsive={responsive}
        containerClass="carousel-container"
        showDots={true}
        keyBoardControl={true}
        removeArrowOnDeviceType={['mobile']}
        centerMode={true}
      >
        {!approvedAvatarsNotInLibrary ||
        approvedAvatarsNotInLibrary.length === 0 ? (
          <p className={'alignCenter'}>
            Your avatar library is currently empty.
          </p>
        ) : (
          approvedAvatarsNotInLibrary.map((avatarSet) => (
            <div key={avatarSet.avatarSetId} className="avatarSet">
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
      {/*TODO-kev: Consider adding a clear button to clear input*/}
      <p>Add in a way to swap between avatars here</p>
    </div>
  );
}
