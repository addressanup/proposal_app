# API Integration Guide - Version Control & Digital Signatures

## Quick Start

This guide shows you how to integrate the enhanced version control and digital signature features into your frontend application.

---

## Authentication

All API endpoints (except public signature endpoints) require JWT authentication:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';

// Set authorization header
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
};
```

---

## Version Control Integration

### 1. Automatic Version Creation

When you update a proposal's content, a version is automatically created:

```javascript
// Update proposal with change description
async function updateProposal(proposalId, updates) {
  const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      content: updates.content,
      changeDescription: 'Updated pricing section based on client feedback'
      // Optional: title, description, status
    })
  });

  const result = await response.json();

  if (result.data.versionCreated) {
    console.log(`New version ${result.data.versionInfo.version.versionNumber} created`);
    console.log(`Lines added: ${result.data.versionInfo.statistics.linesAdded}`);
    console.log(`Lines removed: ${result.data.versionInfo.statistics.linesRemoved}`);
  }

  return result.data;
}
```

### 2. View Version History

```javascript
async function getVersionHistory(proposalId) {
  const response = await fetch(
    `${API_BASE_URL}/proposals/${proposalId}/versions`,
    { headers }
  );

  const { data } = await response.json();

  // Display version timeline
  data.versions.forEach(version => {
    console.log(`Version ${version.versionNumber}`);
    console.log(`By: ${version.createdBy.firstName} ${version.createdBy.lastName}`);
    console.log(`When: ${new Date(version.createdAt).toLocaleString()}`);
    console.log(`Changes: ${version.changeDescription}`);
  });

  return data.versions;
}
```

### 3. Compare Two Versions (GitHub-like Diff)

```javascript
async function compareVersions(proposalId, fromVersion, toVersion) {
  const response = await fetch(
    `${API_BASE_URL}/proposals/${proposalId}/versions/compare?from=${fromVersion}&to=${toVersion}`,
    { headers }
  );

  const { data } = await response.json();

  // Display diff
  return {
    fromVersion: data.fromVersion,
    toVersion: data.toVersion,
    diff: data.diff, // Array of {value, added, removed}
    statistics: data.statistics,
    patch: data.patch // Unified diff format
  };
}
```

### 4. Render Diff in UI

```javascript
function renderDiff(diffData) {
  const container = document.getElementById('diff-container');

  diffData.diff.forEach(part => {
    const span = document.createElement('span');
    span.textContent = part.value;

    if (part.added) {
      span.className = 'diff-added'; // Green background
    } else if (part.removed) {
      span.className = 'diff-removed'; // Red background
    }

    container.appendChild(span);
  });

  // Show statistics
  document.getElementById('stats').innerHTML = `
    <div>Lines Added: ${diffData.statistics.linesAdded}</div>
    <div>Lines Removed: ${diffData.statistics.linesRemoved}</div>
    <div>Change: ${diffData.statistics.changePercentage}%</div>
  `;
}
```

### 5. Revert to Previous Version

```javascript
async function revertToVersion(proposalId, versionNumber) {
  const response = await fetch(
    `${API_BASE_URL}/proposals/${proposalId}/versions/${versionNumber}/revert`,
    {
      method: 'POST',
      headers
    }
  );

  const { data } = await response.json();

  console.log(`Reverted to version ${versionNumber}`);
  console.log(`New version ${data.version.versionNumber} created`);

  return data;
}
```

### 6. Version Statistics

```javascript
async function getVersionStatistics(proposalId) {
  const response = await fetch(
    `${API_BASE_URL}/proposals/${proposalId}/versions/statistics`,
    { headers }
  );

  const { data } = await response.json();

  return {
    totalVersions: data.totalVersions,
    contributors: data.contributors,
    timespan: data.timespan,
    currentVersion: data.currentVersion
  };
}
```

---

## Digital Signature Integration

### 1. Create Signature Request

```javascript
async function requestSignatures(proposalId, signers) {
  const response = await fetch(`${API_BASE_URL}/signature-requests`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      proposalId,
      signatureType: 'ADVANCED', // SIMPLE, ADVANCED, or QUALIFIED
      signingOrder: 'SEQUENTIAL', // or PARALLEL
      signers: [
        {
          signerEmail: 'sender@company.com',
          signerName: 'John Doe',
          signingOrder: 1,
          authMethod: 'EMAIL_VERIFICATION'
        },
        {
          signerEmail: 'recipient@client.com',
          signerName: 'Jane Smith',
          signingOrder: 2,
          authMethod: 'TWO_FACTOR_AUTH'
        }
      ],
      reminderDays: [3, 7, 14], // Send reminders after these days
      expirationDays: 30
    })
  });

  const { data } = await response.json();

  console.log('Signature request created');
  console.log('Emails sent to signers');

  return data.signatureRequest;
}
```

### 2. Public Signature Page (No Auth Required)

When a signer clicks the email link, they land on `/sign/:token`. Your frontend should:

```javascript
// In your signature page component
async function loadSignaturePage(token) {
  // Verify token and get document info (PUBLIC ENDPOINT)
  const response = await fetch(`${API_BASE_URL}/sign/verify/${token}`);

  if (!response.ok) {
    // Handle invalid/expired token
    showError('Invalid or expired signature link');
    return;
  }

  const { data } = await response.json();

  return {
    signer: data.requirement,
    proposal: data.proposal,
    signatureRequest: data.signatureRequest
  };
}
```

### 3. Capture and Submit Signature

```javascript
async function signDocument(token, signatureCanvas) {
  // Get signature as base64 from canvas
  const signatureImage = signatureCanvas.toDataURL('image/png');

  // Optional: Get geolocation (with user permission)
  let geoLocation = null;
  if (navigator.geolocation) {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    geoLocation = `${position.coords.latitude}, ${position.coords.longitude}`;
  }

  // Submit signature (PUBLIC ENDPOINT - no auth needed)
  const response = await fetch(`${API_BASE_URL}/sign/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      signatureImage,
      geoLocation
    })
  });

  const { data } = await response.json();

  if (data.allSignaturesCompleted) {
    // Show completion page with certificate
    showCompletionPage(data.certificate);
  } else {
    // Show success with "waiting for other signers"
    showSuccessPage('Your signature has been recorded. Waiting for other signers.');
  }

  return data;
}
```

### 4. Decline to Sign

```javascript
async function declineSignature(token, reason) {
  const response = await fetch(`${API_BASE_URL}/sign/${token}/decline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });

  const { data } = await response.json();

  showMessage('You have declined to sign this document');

  return data;
}
```

### 5. Monitor Signature Status

```javascript
async function getSignatureRequestStatus(signatureRequestId) {
  const response = await fetch(
    `${API_BASE_URL}/signature-requests/${signatureRequestId}`,
    { headers }
  );

  const { data } = await response.json();

  // Check status of all signers
  data.signatureRequest.signers.forEach(signer => {
    console.log(`${signer.signerName}: ${signer.status}`);
    // Status: PENDING, SENT, VIEWED, SIGNED, DECLINED
  });

  return data.signatureRequest;
}
```

### 6. Send Reminder

```javascript
async function sendSignatureReminder(signatureRequestId) {
  const response = await fetch(
    `${API_BASE_URL}/signature-requests/${signatureRequestId}/remind`,
    {
      method: 'POST',
      headers
    }
  );

  const { data } = await response.json();

  console.log(`Reminders sent to ${data.remindersSent} pending signers`);

  return data;
}
```

### 7. Download Certificate

```javascript
async function downloadCertificate(certificateUrl) {
  const response = await fetch(`${API_BASE_URL}${certificateUrl}`, {
    headers
  });

  const blob = await response.blob();

  // Trigger download
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'certificate.pdf';
  a.click();
}
```

---

## React Integration Examples

### Version Comparison Component

```jsx
import React, { useState, useEffect } from 'react';

function VersionComparison({ proposalId, fromVersion, toVersion }) {
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    async function loadComparison() {
      const response = await fetch(
        `/api/proposals/${proposalId}/versions/compare?from=${fromVersion}&to=${toVersion}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { data } = await response.json();
      setComparison(data);
    }
    loadComparison();
  }, [proposalId, fromVersion, toVersion]);

  if (!comparison) return <div>Loading...</div>;

  return (
    <div className="version-comparison">
      <div className="comparison-header">
        <div>
          Version {comparison.fromVersion.number}
          <span className="author">
            by {comparison.fromVersion.createdBy.firstName}
          </span>
        </div>
        <div>→</div>
        <div>
          Version {comparison.toVersion.number}
          <span className="author">
            by {comparison.toVersion.createdBy.firstName}
          </span>
        </div>
      </div>

      <div className="statistics">
        <span className="added">+{comparison.statistics.linesAdded}</span>
        <span className="removed">-{comparison.statistics.linesRemoved}</span>
        <span className="change">{comparison.statistics.changePercentage}% changed</span>
      </div>

      <div className="diff-content">
        {comparison.diff.map((part, index) => (
          <span
            key={index}
            className={
              part.added ? 'diff-added' :
              part.removed ? 'diff-removed' :
              'diff-unchanged'
            }
          >
            {part.value}
          </span>
        ))}
      </div>
    </div>
  );
}
```

### Signature Canvas Component

```jsx
import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

function SignatureForm({ token, proposal }) {
  const sigCanvas = useRef();
  const [signing, setSigning] = useState(false);

  const handleSign = async () => {
    if (sigCanvas.current.isEmpty()) {
      alert('Please provide a signature');
      return;
    }

    setSigning(true);

    try {
      const signatureImage = sigCanvas.current.toDataURL();

      const response = await fetch(`/api/sign/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureImage })
      });

      const { data } = await response.json();

      if (data.allSignaturesCompleted) {
        // Redirect to completion page
        window.location.href = '/signature-complete';
      } else {
        alert('Your signature has been recorded!');
      }
    } catch (error) {
      alert('Error submitting signature');
    } finally {
      setSigning(false);
    }
  };

  const handleClear = () => {
    sigCanvas.current.clear();
  };

  return (
    <div className="signature-form">
      <h2>Sign: {proposal.title}</h2>

      <div className="proposal-preview">
        <div dangerouslySetInnerHTML={{ __html: proposal.content }} />
      </div>

      <div className="signature-pad">
        <h3>Your Signature</h3>
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            width: 500,
            height: 200,
            className: 'signature-canvas'
          }}
        />
        <div className="signature-buttons">
          <button onClick={handleClear}>Clear</button>
          <button onClick={handleSign} disabled={signing}>
            {signing ? 'Signing...' : 'Sign Document'}
          </button>
        </div>
      </div>

      <div className="legal-notice">
        ⚖️ By signing this document, you are entering into a legally binding agreement.
        The Proposal Platform will act as a legal witness.
      </div>
    </div>
  );
}
```

---

## Error Handling

```javascript
async function apiCall(endpoint, options) {
  try {
    const response = await fetch(endpoint, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API Error');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);

    // Handle specific errors
    if (error.message.includes('Unauthorized')) {
      // Redirect to login
      window.location.href = '/login';
    } else if (error.message.includes('not found')) {
      // Show 404 page
      showNotFound();
    } else {
      // Show generic error
      showError(error.message);
    }

    throw error;
  }
}
```

---

## WebSocket Integration (Future)

For real-time updates when signatures are completed:

```javascript
const socket = io('http://localhost:5000');

// Subscribe to signature request updates
socket.emit('subscribe', { signatureRequestId });

// Listen for signer updates
socket.on('signer:signed', (data) => {
  console.log(`${data.signerName} has signed!`);
  updateSignatureStatus(data);
});

// Listen for completion
socket.on('signature:completed', (data) => {
  console.log('All signatures completed!');
  showCompletionModal(data.certificate);
});
```

---

## Complete Workflow Example

```javascript
// Complete proposal lifecycle
async function completeProposalWorkflow() {
  // 1. Create proposal
  const proposal = await createProposal({
    title: 'Partnership Agreement 2025',
    content: 'Initial proposal content...',
    organizationId: 'org_123'
  });

  // 2. Receiver requests changes (via comment)
  await addComment(proposal.id, {
    content: 'Please revise pricing section'
  });

  // 3. Update proposal (auto-creates Version 2)
  const updated = await updateProposal(proposal.id, {
    content: 'Updated content with new pricing...',
    changeDescription: 'Revised pricing per client feedback'
  });

  // 4. Compare versions
  const diff = await compareVersions(proposal.id, 1, 2);
  console.log('Changes:', diff.statistics);

  // 5. More revisions...
  await updateProposal(proposal.id, {
    content: 'Final content...',
    changeDescription: 'Final revisions',
    status: 'FINAL'
  });

  // 6. Request signatures
  const signatureRequest = await requestSignatures(proposal.id, [
    { signerEmail: 'sender@company.com', signerName: 'John Doe' },
    { signerEmail: 'recipient@client.com', signerName: 'Jane Smith' }
  ]);

  // 7. Monitor status
  setInterval(async () => {
    const status = await getSignatureRequestStatus(signatureRequest.id);
    console.log('Signature status:', status.status);
  }, 5000);

  // 8. When complete, download certificate
  // (triggered by webhook or polling)
}
```

---

## Testing

### Using cURL

```bash
# Get version history
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/proposals/clxxx.../versions

# Compare versions
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/proposals/clxxx.../versions/compare?from=1&to=2"

# Create signature request
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "proposalId": "clxxx...",
    "signatureType": "ADVANCED",
    "signingOrder": "SEQUENTIAL",
    "signers": [
      {
        "signerEmail": "test@example.com",
        "signerName": "Test User"
      }
    ]
  }' \
  http://localhost:5000/api/signature-requests
```

---

## Best Practices

1. **Always provide change descriptions** when updating proposals
2. **Use sequential signing** for documents that need specific order
3. **Set reminder schedules** for time-sensitive signatures
4. **Store blockchain hashes** for long-term verification
5. **Handle token expiration** gracefully in signature flows
6. **Show diff previews** before accepting version changes
7. **Implement optimistic UI updates** for better UX
8. **Cache version history** to reduce API calls
9. **Use WebSockets** for real-time signature updates (when available)
10. **Validate on client** before submitting to API

---

## Rate Limits

- **Version endpoints**: 100 requests per 15 minutes
- **Signature endpoints (auth)**: 100 requests per 15 minutes
- **Signature endpoints (public)**: 10 requests per 15 minutes per IP

---

## Support

For issues or questions:
- Review `ENHANCED_FEATURES.md` for detailed documentation
- Check `API_DOCUMENTATION.md` for complete API reference
- See `FEATURE_SUMMARY.md` for overview and benefits

---

**Last Updated**: 2025-11-15
**API Version**: 1.0
**Status**: Production Ready
