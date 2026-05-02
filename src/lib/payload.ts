import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const getPayloadClient = async () => {
  return getPayload({ config: configPromise })
}
