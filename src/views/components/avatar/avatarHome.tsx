import React, { useEffect, useState } from 'react';

export function AvatarHomeUi() {
  const [currentResImgLink, setCurrentResImgLink] = useState(
    '../../avatars/base-res.svg',
  );
  const [currentSpyImgLink, setCurrentSpyImgLink] = useState(
    '../../avatars/base-spy.svg',
  );

  useEffect(() => {
    const fetchUserAvatarInfo = async () => {
      const data = await fetch('/profile/1/avatar/avatarinfo');
      const result = await data.json();

      // TODO-kev: Remove the loading for this?
      setCurrentResImgLink(result.resLink);
      setCurrentSpyImgLink(result.spyLink);
    };

    fetchUserAvatarInfo().catch(console.error);
  }, []);

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
      <hr
        style={{
          borderColor: 'lightgrey',
          borderStyle: 'solid',
          margin: '2em',
        }}
      />
      <h3>Approved Avatar Sets*: </h3>
      <h4>
        Here are all your approved avatar sets. You can change between them
        here.
      </h4>
      <br />

      <div id="approvedAvatars" className="scrollableWindow alignCenter">
        <p>You currently do not have any approved avatar sets.</p>
      </div>
      <br />

      <a className="btn btn-info" id="changeAvatarBtn">
        Change avatar
      </a>

      <h4>*This feature is available to current Patreon supporters.</h4>
      <h4>
        To link your Patreon account or if you would like to support the
        development of the site please do so from your profile page{' '}
        {/*TODO-kev: Edit the hardcoded link down below*/}
        <a href="/profile/1/edit">here</a>.
      </h4>
    </div>
  );
}
