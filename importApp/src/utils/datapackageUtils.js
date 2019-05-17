import {Package} from 'datapackage';
import {apiUri} from '../config/default'

export async function loadPackage () {
  const dataPackage = await Package.load('ricardo_descriptor.json');
  console.log(dataPackage)
}