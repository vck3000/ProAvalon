import React, { useState } from 'react';

export function AvatarHomeUi() {
  const [currentResImgLink, setCurrentResImgLink] = useState(
    '../../avatars/base-res.svg',
  );
  const [currentSpyImgLink, setCurrentSpyImgLink] = useState(
    '../../avatars/base-spy.svg',
  );

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
      {/*TODO-kev: Edit the below hardcoded username*/}
      <a className="btn btn-info" href="/profile/1/customavatar">
        Submit a custom Avatar
      </a>
    </div>
  );
}
