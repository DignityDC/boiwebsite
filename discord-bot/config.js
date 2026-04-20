
const ROLES = {
  DIRECTOR:           '1488519188921192518',
  DEPUTY_DIRECTOR:    '1488519194478776591',
  EXEC_DIRECTOR:      '1488519206092935178',
  CHIEF_OVERSIGHT:    '1488519211386015816',
  SR_STRATEGIC:       '1488519216503193830',
  CMD_LIAISON:        '1488519227261325373',
  SR_CMD_ADVISOR:     '1488519232885882981',
  CMD_OPS_MANAGER:    '1488519244034605207',
  SR_FIELD_SUPERVISOR:'1488519255149510776',
  FIELD_SUPERVISOR:   '1488519260690186320',
  JR_FIELD_SUPERVISOR:'1488519265823752282',
  LEAD_FIELD_AGENT:   '1488519276364304495',
  SR_FIELD_AGENT:     '1488519287412101231',
  FIELD_AGENT:        '1488519293296709672',
  AGENT_IN_TRAINING:  '1491020284554383492',

  OVERRIDE:           '1488519178326380574',
  BUREAU_TRAINING_ACADEMY: '1488519314716889163',
  UNDER_INVESTIGATION:'1488539750678925422',
  STRIKE:             '1488539394280521903',
};

const HIERARCHY = [
  ROLES.DIRECTOR,
  ROLES.DEPUTY_DIRECTOR,
  ROLES.EXEC_DIRECTOR,
  ROLES.CHIEF_OVERSIGHT,
  ROLES.SR_STRATEGIC,
  ROLES.CMD_LIAISON,
  ROLES.SR_CMD_ADVISOR,
  ROLES.CMD_OPS_MANAGER,
  ROLES.SR_FIELD_SUPERVISOR,
  ROLES.FIELD_SUPERVISOR,
  ROLES.JR_FIELD_SUPERVISOR,
  ROLES.LEAD_FIELD_AGENT,
  ROLES.SR_FIELD_AGENT,
  ROLES.FIELD_AGENT,
  ROLES.AGENT_IN_TRAINING,
];

const ROLE_NAMES = {
  [ROLES.DIRECTOR]:           'Director of Operational Integrity',
  [ROLES.DEPUTY_DIRECTOR]:    'Deputy Director of Operational Integrity',
  [ROLES.EXEC_DIRECTOR]:      'Executive Director of Enforcement',
  [ROLES.CHIEF_OVERSIGHT]:    'Chief Oversight Officer',
  [ROLES.SR_STRATEGIC]:       'Senior Strategic Director',
  [ROLES.CMD_LIAISON]:        'Command Liaison Officer',
  [ROLES.SR_CMD_ADVISOR]:     'Senior Command Advisor',
  [ROLES.CMD_OPS_MANAGER]:    'Command Operations Manager',
  [ROLES.SR_FIELD_SUPERVISOR]:'Senior Field Supervisor',
  [ROLES.FIELD_SUPERVISOR]:   'Field Supervisor',
  [ROLES.JR_FIELD_SUPERVISOR]:'Junior Field Supervisor',
  [ROLES.LEAD_FIELD_AGENT]:   'Lead Field Agent',
  [ROLES.SR_FIELD_AGENT]:     'Senior Field Agent',
  [ROLES.FIELD_AGENT]:        'Field Agent',
  [ROLES.AGENT_IN_TRAINING]:  'Agent in Training',
};

const CHANNELS = {
  GRADUATE_LOG:       '1488525273824493761',
  WARN_LOG:           '1488525262046887989',
  DEMOTION_LOG:       '1488520005766086868',
  TERMINATION_LOG:    '1488525268216975410',
  STRIKE_LOG:         '1488525279545790625',
  APPROVAL_LOG:       '1491025165167886398',
  INVESTIGATION_LOG:  '1491031350600273991',
  PROMOTION_LOG:      '1491031583170236436',
  APPEAL_LOG:         '1488520011101507737',
  APPLICATION_LOG:    process.env.APPLICATION_CHANNEL_ID || '',
};

function getHighestRankIndex(member) {
  for (let i = 0; i < HIERARCHY.length; i++) {
    if (member.roles.cache.has(HIERARCHY[i])) return i;
  }
  return -1;
}

function getHighestRole(member) {
  const idx = getHighestRankIndex(member);
  return idx === -1 ? null : HIERARCHY[idx];
}

function outranks(executorMember, targetMember) {
  const eIdx = getHighestRankIndex(executorMember);
  const tIdx = getHighestRankIndex(targetMember);
  return eIdx !== -1 && eIdx < tIdx;
}

function hasOverride(member) {
  return member.roles.cache.has(ROLES.OVERRIDE);
}

function hasAtLeast(member, roleId) {
  const memberIdx = getHighestRankIndex(member);
  const requiredIdx = HIERARCHY.indexOf(roleId);
  return memberIdx !== -1 && memberIdx <= requiredIdx;
}

module.exports = { ROLES, HIERARCHY, ROLE_NAMES, CHANNELS, getHighestRankIndex, getHighestRole, outranks, hasOverride, hasAtLeast };
