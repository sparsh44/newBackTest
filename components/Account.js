import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function Account({ session }) {


  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState(null)
  const [full_name, setFull_name] = useState(null) 
  const [website, setWebsite] = useState(null)
  const [avatar_url, setAvatarUrl] = useState(null)
  const [image, setImage] = useState(null)

  useEffect(() => {
    getProfile()
  }, [session])
  
  async function getCurrentUser() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      throw error
    }

    if (!session?.user) {
      throw new Error('User not logged in')
    }

    return session.user
  }

  async function getProfile() {
    try {
      setLoading(true)
      const user = await getCurrentUser()

      let { data, error, status } = await supabase
        .from('profiles')
        .select(`username, full_name, website, avatar_url`)
        .eq('userID', user.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setFull_name(data.full_name)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({ username, full_name, website, avatar_url }) {
    try {
      setLoading(true)
       const user = await getCurrentUser()

      const updates = {
        userID: user.id,
        username,
        full_name,
        website,
        avatar_url,
        updated_at: new Date(),
      }

      let { error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        throw error
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e)=>{
    e.preventDefault()
    if(image)
    {
      const {data, error} = await supabase.storage.from('avatars').upload(`${Date.now()}_${image.name}`, image)
      if(error)
      {
        console.log(error)
      }
      if(data)
      {
        console.log(data)
        setAvatarUrl(data.path)
      }
      
    }
  }
  
  return (
    <div className="form-widget">
      <div>
      
        <img src={`https://auoayauprtcjcjcyzvwp.supabase.co/storage/v1/object/public/avatars/${avatar_url}`} width ={100} height={100}/>
      </div>
      <form onSubmit ={handleSubmit}>
        <label htmlFor='avatar'>
          Choose Avatar
        </label>

        <input
        type = "file"
        accept={'image/jpeg image/jpg image/png'}
        onChange = {e => setImage(e.target.files[0])}
        />
        <button type = {"submit"}>Upload</button>
      </form>

      
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" value={session.user.email} disabled />
      </div>
      <div>
        <label htmlFor="username">username</label>
        <input
          id="username"
          type="text"
          value={username || ''}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="full_name">Full Name</label>
        <input
          id="full_name"
          type="text"
          value={full_name || ''}
          onChange={(e) => setFull_name(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="website">Websites</label>
        <input
          id="website"
          type="website"
          value={website || ''}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div>
        <button
          className="button primary block"
          onClick={() => updateProfile({ username, full_name, website, avatar_url })}
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>

      <div>
        <button
          className="button block"
          onClick={() => supabase.auth.signOut()}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}