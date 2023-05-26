module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  await deploy ('Rental', {
    from: deployer,
    log: true,
    args: [
      0, // bookingReferenceTime is epoch
      60 * 60, // bookingIntervalSize is 1 hour
    ]
  })
}
module.exports.tags = ['Rental']

