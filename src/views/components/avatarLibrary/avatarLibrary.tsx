import React, { useEffect, useState } from 'react';

export function AvatarLibrary() {
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
        />
        <button className="btn btn-warning" id="getUserAvatarsButton">
          Get Avatars
        </button>
      </div>

      <br />
    </div>
  );
}
