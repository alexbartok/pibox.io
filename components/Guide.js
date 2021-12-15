import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from './Guide.module.css'
import * as markerjs2 from 'markerjs2'
// import Pica from 'pica'
// const pica = Pica()

const b2Auth = null
const B2_BUCKET_ID = '8f2932890588b3b67bdb0711'
const B2_STATIC_URL = 'https://pibox-guides.s3.us-west-002.backblazeb2.com/'

const Guide = () => {
  let imgRefs = []
  const router = useRouter()
  const { slug } = router.query
  const showEditButtons = slug?.[1] === 'edit'
  const [editing, setEditing] = useState(false)
  useEffect(() => {
    setEditing(slug?.[1] === 'edit')
  }, slug)

  const [imgState, setImgState] = useState([])

  const [data, setData] = useState({ title: 'Loading...', steps: [] })
  const { title, steps } = data

  useEffect(() => {
    async function fetchGuide() {
      if (!router.query.slug) return
      const res = await window.fetch(`https://api.kubesail.com/pibox/guides/${slug[0]}`, {
        headers: {
          'content-type': 'application/json',
        },
      })
      let guide
      try {
        guide = await res.json()
      } catch {
        setData({ title: 'Failed to load guide.', steps: [] })
        return
      }
      if (res.status === 200) {
        setData(guide.data)
        setImgState(new Array(guide.data.steps.length).fill(0))
      } else {
        setData({ title: 'Failed to load guide.', steps: [] })
      }
    }
    fetchGuide()
  }, [slug])

  if (typeof window !== 'undefined') window.setData = () => setData(window.data)
  if (typeof window !== 'undefined')
    window.getData = () => {
      window.data = data
      console.log('saved as window.data', data)
    }

  function showMarkerArea(stepIndex) {
    const img = imgRefs[stepIndex]
    if (!img) return
    const markerArea = new markerjs2.MarkerArea(img)
    markerArea.addEventListener('render', event => {
      if (!img) return
      console.log(JSON.stringify(event.state))
      img.src = event.dataUrl
    })
    markerArea.show()
  }

  async function auth() {
    if (b2Auth) return true
    const B2_KEY_ID = window.localStorage.getItem('B2_KEY_ID')
    const B2_KEY = window.localStorage.getItem('B2_KEY')
    if (!B2_KEY || !B2_KEY_ID) {
      alert('B2_KEY or B2_KEY_ID not defined')
      return false
    }

    const res = await window.fetch(
      '/api/b2?url=https://api.backblazeb2.com/b2api/v2/b2_authorize_account',
      {
        headers: {
          authorization: `Basic ${Buffer.from(`${B2_KEY_ID}:${B2_KEY}`, 'utf8').toString(
            'base64'
          )}`,
        },
      }
    )

    b2Auth = await res.json()
    return true
  }

  async function upload(data, filename) {
    if (!(await auth())) return

    // request upload URL
    const uploadUrlRes = await window.fetch(
      `/api/b2?url=${b2Auth.apiUrl}/b2api/v2/b2_get_upload_url`,
      {
        method: 'POST',
        headers: { authorization: b2Auth.authorizationToken },
        body: JSON.stringify({ bucketId: B2_BUCKET_ID }),
      }
    )
    const uploadUrl = await uploadUrlRes.json()
    console.log({ uploadUrl })

    const hashBuffer = await crypto.subtle.digest('SHA-1', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const digest = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    console.log({ digest })

    var binary = ''
    var bytes = new Uint8Array(data)
    var len = bytes.byteLength
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    const hexData = window.btoa(binary)

    // upload file
    const uploadRes = await window.fetch(`/api/b2?url=${uploadUrl.uploadUrl}`, {
      method: 'POST',
      headers: {
        authorization: uploadUrl.authorizationToken,
        'x-bz-file-name': filename,
        'x-bz-content-sha1': digest,
        'content-type': 'image/jpeg', // TODO should infer this
        'content-length': data.length,
      },
      body: hexData,
      // body: data,
    })

    if (uploadRes.status !== 200) return 'ERROR'
    await uploadRes.json()
    return 'SUCCESS'
  }

  return (
    <div className={styles.Guide}>
      {showEditButtons && (
        <div>
          {editing ? (
            <button onClick={() => setEditing(false)}>preview</button>
          ) : (
            <button onClick={() => setEditing(true)}>edit</button>
          )}
          <button
            onClick={() => {
              const KUBESAIL_API_KEY = window.localStorage.getItem('KUBESAIL_API_KEY')
              const KUBESAIL_API_SECRET = window.localStorage.getItem('KUBESAIL_API_SECRET')
              if (!KUBESAIL_API_KEY || !KUBESAIL_API_SECRET) {
                alert('KUBESAIL_API_KEY or KUBESAIL_API_SECRET not defined')
                return false
              }
              const slug = router.query.slug[0]
              window.fetch(`https://api.kubesail.com/admin/pibox/guides`, {
                method: 'POST',
                headers: {
                  authorization: `Basic ${btoa(`${KUBESAIL_API_KEY}:${KUBESAIL_API_SECRET}`)}`,
                  'content-type': 'application/json',
                },
                body: JSON.stringify({ slug, data }),
              })
            }}
          >
            save
          </button>
        </div>
      )}
      <h1>
        {editing ? (
          <input value={data.title} onChange={e => setData({ ...data, title: e.target.value })} />
        ) : (
          title
        )}
      </h1>
      {steps.map((step, stepIndex) => (
        <div className={styles.Step} key={stepIndex}>
          <h2>
            <b>Step {stepIndex + 1}</b>{' '}
            {editing ? (
              <input
                value={step.title}
                onChange={e =>
                  setData({
                    ...data,
                    steps: [
                      ...data.steps.slice(0, stepIndex),
                      { ...step, title: e.target.value },
                      ...data.steps.slice(stepIndex + 1),
                    ],
                  })
                }
              />
            ) : (
              step.title
            )}
          </h2>
          <div className={styles.StepLayout}>
            <div className={styles.StepImg}>
              <img
                crossOrigin="anonymous"
                ref={node => (imgRefs[stepIndex] = node)}
                src={B2_STATIC_URL + step.images[imgState[stepIndex] || 0]?.filename + '_thumb'}
                alt="sample"
                onClick={() => showMarkerArea(stepIndex)}
              />
            </div>
            <div className={styles.StepLines}>
              {step.images.length > 1 && (
                <div className={styles.StepImgThumbnails}>
                  {step.images.map((image, imageIndex) => {
                    const setActiveImg = () => {
                      setImgState([
                        ...imgState.splice(0, stepIndex),
                        imageIndex,
                        ...imgState.splice(stepIndex + 1),
                      ])
                      console.log(imgState)
                    }
                    return (
                      <img
                        onMouseEnter={setActiveImg}
                        onClick={setActiveImg}
                        key={imageIndex}
                        src={B2_STATIC_URL + image.filename + '_thumb'}
                      />
                    )
                  })}
                </div>
              )}
              <ul>
                {step.lines.map((line, lineIndex) => (
                  <li key={lineIndex}>
                    <span className={styles.StepLineBullet} style={{ color: line.color }}>
                      ⬢
                    </span>
                    {editing && (
                      <input
                        value={line.color}
                        onChange={e =>
                          setData({
                            ...data,
                            steps: [
                              ...data.steps.slice(0, stepIndex),
                              {
                                ...step,
                                lines: [
                                  ...step.lines.slice(0, lineIndex),
                                  { ...line, color: e.target.value },
                                  ...step.lines.slice(lineIndex + 1),
                                ],
                              },
                              ...data.steps.slice(stepIndex + 1),
                            ],
                          })
                        }
                      />
                    )}
                    {editing ? (
                      <textarea
                        value={line.text}
                        onChange={e =>
                          setData({
                            ...data,
                            steps: [
                              ...data.steps.slice(0, stepIndex),
                              {
                                ...step,
                                lines: [
                                  ...step.lines.slice(0, lineIndex),
                                  { ...line, text: e.target.value },
                                  ...step.lines.slice(lineIndex + 1),
                                ],
                              },
                              ...data.steps.slice(stepIndex + 1),
                            ],
                          })
                        }
                      />
                    ) : (
                      line.text
                    )}
                  </li>
                ))}
                {editing && (
                  <>
                    <span
                      className={styles.EditButton}
                      onClick={() =>
                        setData({
                          ...data,
                          steps: [
                            ...data.steps.slice(0, stepIndex),
                            { ...step, lines: [...step.lines, { color: 'black', text: '' }] },
                            ...data.steps.slice(stepIndex + 1),
                          ],
                        })
                      }
                    >
                      add line
                    </span>
                    <label className={styles.EditButton}>
                      <span style={{ cursor: 'pointer' }}>add image</span>
                      <input
                        style={{ display: 'none' }}
                        type="file"
                        onChange={e => {
                          const filename = crypto.randomUUID()

                          // Upload original
                          const origReader = new FileReader()
                          origReader.readAsArrayBuffer(e.target.files[0])
                          origReader.onload = async readerEvent => {
                            const file = readerEvent.target.result
                            await upload(file, filename)
                          }

                          // Upload resized version
                          const resizedReader = new FileReader()
                          resizedReader.readAsDataURL(e.target.files[0])
                          resizedReader.onload = async readerEvent => {
                            const image = new Image()
                            image.src = readerEvent.target.result
                            image.onload = function () {
                              console.log('got onload')
                              // Resize the image
                              var canvas = document.createElement('canvas'),
                                max_size = 800,
                                width = image.width,
                                height = image.height
                              if (width > height) {
                                if (width > max_size) {
                                  height *= max_size / width
                                  width = max_size
                                }
                              } else {
                                if (height > max_size) {
                                  width *= max_size / height
                                  height = max_size
                                }
                              }
                              canvas.width = width
                              canvas.height = height
                              canvas.getContext('2d').drawImage(image, 0, 0, width, height)
                              canvas.toBlob(async blob => {
                                const resizedImg = await blob.arrayBuffer()
                                await upload(resizedImg, `${filename}_thumb`)
                                // add image URL to data
                                setData({
                                  ...data,
                                  steps: [
                                    ...data.steps.slice(0, stepIndex),
                                    {
                                      ...step,
                                      images: [...step.images, { filename, markers: {} }],
                                    },
                                    ...data.steps.slice(stepIndex + 1),
                                  ],
                                })
                              })
                            }
                          }
                        }}
                      />
                    </label>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      ))}
      {editing && (
        <span
          onClick={() => {
            setData({
              ...data,
              steps: [...data.steps, { images: [], title: '', lines: [] }],
            })
            setImgState(new Array(data.steps.length).fill(0))
          }}
        >
          add step
        </span>
      )}
    </div>
  )
}

export default Guide
