import React, { useEffect, useState } from 'react';
import { S3AvatarSet } from '../../../clients/s3/S3Agent';
import Swal from 'sweetalert2';

export function AvatarLibrary() {
  const [usernameToSearchAvatar, setUsernameToSearchAvatar] = useState<
    string | null
  >(null);
  const [avatarLibrary, setAvatarLibrary] = useState<S3AvatarSet[] | null>(
    null,
  );

  const handleGetAvatars = async () => {
    if (!usernameToSearchAvatar) {
      Swal.fire({
        title: 'Please enter a username.',
        icon: 'warning',
      });
      return;
    }

    const response = await fetch(
      `/profile/mod/avatarlibrary?username=${usernameToSearchAvatar}`,
    );
    const data: S3AvatarSet[] = await response.json();

    console.log(data);
  };

  return (
    <div>
      <h1>
        <u>Approved Avatars for a User:</u>
      </h1>
      <br />
      <div id="approvedAvatarsForUser" className="scrollableWindow alignCenter">
        <p>
          Here you can see the approved avatars for a user once you input their
          username below.
        </p>
      </div>
      <br />

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
    </div>
  );
}
